import { PRODUCT_CATEGORIES } from "../../config.js";
import { env } from "../../env.js";
import { badRequest } from "../../utils/api-error.js";
import { extractPrice, titleCase, tokenize, uniqueStrings } from "../../utils/text.js";
import { toImageDataUrl } from "./image-source.js";
import { AiAnalysisDraft, AiAnalyzeInput, AiProvider } from "./provider.types.js";

const schema = {
  name: "product_onboarding_analysis",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["combinedText", "name", "brand", "category", "mrp", "price", "confidence", "keywords", "notes"],
    properties: {
      combinedText: { type: "string" },
      name: { type: "string" },
      brand: { type: "string" },
      category: { type: "string", enum: [...PRODUCT_CATEGORIES] },
      mrp: { type: ["number", "null"] },
      price: { type: ["number", "null"] },
      confidence: { type: "number", minimum: 0, maximum: 1 },
      keywords: {
        type: "array",
        items: { type: "string" }
      },
      notes: {
        type: "array",
        items: { type: "string" }
      }
    }
  }
} as const;

const prompt = [
  "You analyze a retail product image for a pickup-first local commerce app.",
  "Extract visible packaging text and return a compact JSON object.",
  "If the exact product name is unclear, choose the most likely short retail name.",
  "If the brand is unclear, return 'Local Brand'.",
  "Category must be one of: grocery, stationery, pharmacy, personal-care, beverages, snacks, household.",
  "Use null for prices that are not visible.",
  "Keep keywords short and useful for search."
].join(" ");

type OpenAiResponsePayload = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
    }>;
  }>;
};

export class OpenAiVisionProvider implements AiProvider {
  private readonly apiKey = env.openAiApiKey;
  private readonly model = env.openAiModel;
  private readonly baseUrl = env.openAiBaseUrl.replace(/\/$/, "");

  async analyze(input: AiAnalyzeInput): Promise<AiAnalysisDraft> {
    if (!this.apiKey) {
      throw badRequest("OPENAI_API_KEY is required when AI_PROVIDER=openai.");
    }

    const imageInput = await this.buildImageInput(input.imageUrl);
    const response = await fetch(`${this.baseUrl}/responses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        input: [
          {
            role: "system",
            content: [{ type: "input_text", text: prompt }]
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `Manual hint: ${input.manualHint ?? "none"}\nRaw OCR hint: ${input.rawText ?? "none"}`
              },
              imageInput
            ]
          }
        ],
        text: {
          format: {
            type: "json_schema",
            ...schema
          }
        }
      })
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`OpenAI analyze failed (${response.status}): ${details}`);
    }

    const payload = (await response.json()) as OpenAiResponsePayload;
    const parsed = this.readStructuredJson(payload);
    const combinedText = [input.rawText, parsed.combinedText, input.manualHint].filter(Boolean).join(" ").trim();
    const mrp = parsed.mrp ?? extractPrice(combinedText);

    return {
      provider: "openai",
      model: this.model,
      combinedText,
      confidence: Number((parsed.confidence ?? 0.75).toFixed(2)),
      extracted: {
        name: titleCase(parsed.name || "Local Product"),
        brand: titleCase(parsed.brand || "Local Brand"),
        category: parsed.category,
        mrp,
        price: parsed.price ?? mrp
      },
      keywords: uniqueStrings((parsed.keywords ?? []).flatMap((value) => tokenize(value))).slice(0, 8),
      notes: parsed.notes ?? []
    };
  }

  private async buildImageInput(imageUrl: string) {
    const dataUrl = await toImageDataUrl(imageUrl);
    return {
      type: "input_image" as const,
      image_url: dataUrl ?? imageUrl,
      detail: "high" as const
    };
  }

  private readStructuredJson(payload: OpenAiResponsePayload) {
    const rawText =
      payload.output_text ??
      payload.output?.flatMap((entry) => entry.content ?? []).find((entry) => typeof entry.text === "string")?.text;

    if (!rawText) {
      throw new Error("OpenAI response did not include structured text.");
    }

    return JSON.parse(rawText) as {
      combinedText: string;
      name: string;
      brand: string;
      category: typeof PRODUCT_CATEGORIES[number];
      mrp: number | null;
      price: number | null;
      confidence: number;
      keywords: string[];
      notes: string[];
    };
  }
}
