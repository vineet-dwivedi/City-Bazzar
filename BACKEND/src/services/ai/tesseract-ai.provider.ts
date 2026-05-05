import Tesseract from "tesseract.js";
import { resolveImageSourceForOcr } from "./image-source.js";
import { LocalExtractionProvider } from "./local-extraction.provider.js";
import { AiAnalysisDraft, AiAnalyzeInput, AiProvider } from "./provider.types.js";

// Free OCR path: Tesseract reads text, then the local extractor shapes it.
export class TesseractAiProvider implements AiProvider {
  private readonly extractionProvider = new LocalExtractionProvider();

  async analyze(input: AiAnalyzeInput): Promise<AiAnalysisDraft> {
    const source = resolveImageSourceForOcr(input.imageUrl);
    const result = await Tesseract.recognize(source, "eng");
    const ocrText = result.data.text.replace(/\s+/g, " ").trim();
    const combinedText = [input.rawText, input.manualHint, ocrText].filter(Boolean).join(" ").trim();
    const extracted = this.extractionProvider.extract({ text: combinedText });
    const confidence = this.readConfidence(result.data.confidence, extracted.keywords.length);

    return {
      provider: "tesseract",
      model: "tesseract.js",
      combinedText,
      confidence,
      extracted: {
        name: extracted.name,
        brand: extracted.brand,
        category: extracted.category,
        mrp: extracted.mrp,
        price: extracted.price
      },
      keywords: extracted.keywords,
      notes: [
        "Free OCR is active through Tesseract.",
        "Best results come from clear front-facing product photos."
      ]
    };
  }

  private readConfidence(rawConfidence: number, keywordCount: number) {
    const normalized = Number.isFinite(rawConfidence) ? rawConfidence / 100 : 0.35;
    return Number(Math.min(0.9, Math.max(normalized, 0.25 + keywordCount * 0.04)).toFixed(2));
  }
}
