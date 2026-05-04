import { LocalExtractionProvider } from "./local-extraction.provider.js";
import { LocalOcrProvider } from "./local-ocr.provider.js";
import { AiAnalysisDraft, AiAnalyzeInput, AiProvider } from "./provider.types.js";

// Local fallback keeps development and offline use working.
export class LocalAiProvider implements AiProvider {
  private readonly ocrProvider = new LocalOcrProvider();
  private readonly extractionProvider = new LocalExtractionProvider();

  async analyze(input: AiAnalyzeInput): Promise<AiAnalysisDraft> {
    const combinedText = await this.ocrProvider.readText(input);
    const extracted = this.extractionProvider.extract({ text: combinedText });
    const confidence = Math.min(0.55, 0.22 + extracted.keywords.length * 0.04);

    return {
      provider: "local",
      model: "heuristic-fallback",
      combinedText,
      confidence: Number(confidence.toFixed(2)),
      extracted: {
        name: extracted.name,
        brand: extracted.brand,
        category: extracted.category,
        mrp: extracted.mrp,
        price: extracted.price
      },
      keywords: extracted.keywords,
      notes: [
        "AI provider fallback is active.",
        "Extraction is based on filename, raw text, and manual hints."
      ]
    };
  }
}
