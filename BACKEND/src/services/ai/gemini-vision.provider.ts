import { PRODUCT_CATEGORIES } from "../../config.js";
import { env } from "../../env.js";
import { badRequest } from "../../utils/api-error.js";
import { extractPrice, titleCase, tokenize, uniqueStrings } from "../../utils/text.js";
import { toInlineImageData } from "./image-source.js";
import { AiAnalysisDraft, AiAnalyzeInput, AiProvider } from "./provider.types.js";

const propertyOrdering = [
  "combinedText",
  "name",
  "brand",
  "category",
  "mrp",
  "price",
  "confidence",
  "keywords",
  "notes"
] as const;

const responseSchema = {
  type: "object",
  additionalProperties: false,
  propertyOrdering: [...propertyOrdering],
  required: [...propertyOrdering],
  properties: {
    combinedText: { type: "string", description: "Visible product text merged into one short string." },
    name: { type: "string", description: "Short retail product name." },
    brand: { type: "string", description: "Visible or most likely product brand." },
    category: { type: "string", enum: [...PRODUCT_CATEGORIES], description: "One allowed product category." },
    mrp: { type: ["number", "null"], description: "Visible MRP if present." },
    price: { type: ["number", "null"], description: "Visible selling price if present." },
    confidence: { type: "number", minimum: 0, maximum: 1, description: "Extraction confidence between 0 and 1." },
    keywords: {
      type: "array",
      items: { type: "string" },
      description: "Short search keywords."
    },
    notes: {
      type: "array",
      items: { type: "string" },
      description: "Short notes about uncertain fields."
    }
  }
} as const;

const prompt = [
  "Analyze this retail product image for a pickup-first local commerce app.",
  "Extract product text and return only schema-compliant JSON.",
  "Choose the most likely short retail product name.",
  "If brand is unclear, return Local Brand.",
  "Category must be one of: grocery, stationery, pharmacy, personal-care, beverages, snacks, household.",
  "Use null for prices that are not visible.",
  "Keep keywords short and practical."
].join(" ");

type GeminiResponsePayload = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

export class GeminiVisionProvider implements AiProvider {
  private readonly apiKey = env.geminiApiKey;
  private readonly model = env.geminiModel;
  private readonly baseUrl = env.geminiBaseUrl.replace(/\/$/, "");

  async analyze(input: AiAnalyzeInput): Promise<AiAnalysisDraft> {
    if (!this.apiKey) {
      throw badRequest("GEMINI_API_KEY is required when AI_PROVIDER=gemini.");
    }

    const image = await toInlineImageData(input.imageUrl);
    const response = await fetch(
      `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `${prompt}\nManual hint: ${input.manualHint ?? "none"}\nRaw OCR hint: ${input.rawText ?? "none"}`
                },
                {
                  inline_data: {
                    mime_type: image.mimeType,
                    data: image.data
                  }
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseJsonSchema: responseSchema
          }
        })
      }
    );

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Gemini analyze failed (${response.status}): ${details}`);
    }

    const payload = (await response.json()) as GeminiResponsePayload;
    const parsed = this.readStructuredJson(payload);
    const combinedText = [input.rawText, parsed.combinedText, input.manualHint].filter(Boolean).join(" ").trim();
    const mrp = parsed.mrp ?? extractPrice(combinedText);

    return {
      provider: "gemini",
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

  private readStructuredJson(payload: GeminiResponsePayload) {
    const rawText = payload.candidates?.[0]?.content?.parts?.find((entry) => typeof entry.text === "string")?.text;

    if (!rawText) {
      throw new Error("Gemini response did not include structured text.");
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
