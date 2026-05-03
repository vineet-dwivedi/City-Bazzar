// Onboarding orchestration stays compact: OCR -> catalog match -> extraction -> notes.
import { OnboardingAnalysis } from "../types.js";
import { dataStore } from "./store.js";
import { CatalogMatcher } from "./ai/catalog-matcher.js";
import { LocalExtractionProvider } from "./ai/local-extraction.provider.js";
import { LocalOcrProvider } from "./ai/local-ocr.provider.js";

class OnboardingService {
  private readonly ocrProvider = new LocalOcrProvider();
  private readonly extractionProvider = new LocalExtractionProvider();
  private readonly catalogMatcher = new CatalogMatcher();

  async analyze(input: {
    imageUrl: string;
    rawText?: string;
    manualHint?: string;
    shopId?: string;
  }): Promise<OnboardingAnalysis> {
    const combinedText = await this.ocrProvider.readText(input);
    const bestMatch = await this.catalogMatcher.match(combinedText);
    const inferredBrand = bestMatch?.product.brand ?? await this.catalogMatcher.inferBrand(combinedText) ?? "Local Brand";
    const extracted = this.extractionProvider.extract({
      text: combinedText,
      fallbackBrand: inferredBrand,
      fallbackCategory: bestMatch?.product.category,
      fallbackName: bestMatch?.product.name
    });
    const confidence = bestMatch?.score ?? Math.min(0.45, extracted.keywords.length * 0.08);
    const notes = this.buildNotes({
      rawText: input.rawText,
      mrp: extracted.mrp,
      confidence
    });

    const analysis: OnboardingAnalysis = {
      source: {
        imageUrl: input.imageUrl,
        combinedText
      },
      extracted: {
        name: extracted.name,
        brand: extracted.brand,
        category: extracted.category,
        mrp: extracted.mrp,
        price: extracted.price
      },
      catalogMatch: bestMatch && bestMatch.score >= 0.6
        ? {
            status: "existing",
            confidence: Number(bestMatch.score.toFixed(2)),
            product: bestMatch.product
          }
        : {
            status: "new",
            confidence: Number(confidence.toFixed(2))
          },
      suggestedKeywords: extracted.keywords,
      notes
    };

    if (input.shopId) {
      analysis.sessionId = await dataStore.createOnboardingSession({
        shopId: input.shopId,
        sourceImageUrl: input.imageUrl,
        rawOcrText: input.rawText,
        manualHint: input.manualHint,
        analysis
      });
    }

    return analysis;
  }

  private buildNotes(input: {
    rawText?: string;
    mrp: number | null;
    confidence: number;
  }) {
    const notes: string[] = [];

    if (!input.rawText) {
      notes.push("OCR text is currently derived from upload naming and owner hints.");
    }

    if (!input.mrp) {
      notes.push("Price was not confidently detected. Please verify MRP manually.");
    }

    if (input.confidence < 0.6) {
      notes.push("Catalog confidence is low. Confirm carefully before saving.");
    }

    return notes;
  }
}

export const onboardingService = new OnboardingService();
