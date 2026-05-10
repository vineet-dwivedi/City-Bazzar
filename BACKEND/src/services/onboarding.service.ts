// Onboarding stays compact: provider extract -> catalog match -> save traceable session.
import { env } from "../env.js";
import { OnboardingAnalysis } from "../types.js";
import { catalogService } from "./catalog.service.js";
import { dataStore } from "./store.js";
import { LocalAiProvider } from "./ai/local-ai.provider.js";
import { createAiProvider } from "./ai/provider.js";

class OnboardingService {
  private readonly aiProvider = createAiProvider();
  private readonly fallbackProvider = new LocalAiProvider();

  async analyze(input: {
    imageUrl: string;
    rawText?: string;
    manualHint?: string;
    shopId?: string;
  }): Promise<OnboardingAnalysis> {
    const draft = await this.readDraft(input);
    const bestMatch = await catalogService.findBestStructuredMatch({
      name: draft.extracted.name,
      brand: draft.extracted.brand,
      category: draft.extracted.category,
      keywords: draft.keywords
    });
    const confidence = bestMatch ? Math.max(bestMatch.score, draft.confidence) : draft.confidence;
    const analysis: OnboardingAnalysis = {
      meta: {
        provider: draft.provider,
        model: draft.model,
        extractionConfidence: Number(draft.confidence.toFixed(2))
      },
      source: {
        imageUrl: input.imageUrl,
        combinedText: draft.combinedText
      },
      extracted: draft.extracted,
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
      suggestedKeywords: draft.keywords,
      notes: this.buildNotes(draft.notes, {
        usedFallback: draft.provider === "local" && env.aiProvider === "gemini",
        mrp: draft.extracted.mrp,
        confidence
      })
    };

    if (input.shopId) {
      analysis.sessionId = await dataStore.createOnboardingSession({
        shopId: input.shopId,
        sourceImageUrl: input.imageUrl,
        rawOcrText: input.rawText,
        manualHint: input.manualHint,
        analysis,
        modelMeta: {
          provider: draft.provider,
          model: draft.model,
          confidence: analysis.meta.extractionConfidence
        }
      });
    }

    return analysis;
  }

  private async readDraft(input: {
    imageUrl: string;
    rawText?: string;
    manualHint?: string;
  }) {
    try {
      return await this.aiProvider.analyze(input);
    } catch (error) {
      const fallback = await this.fallbackProvider.analyze(input);
      fallback.notes.unshift(`Primary AI provider failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      return fallback;
    }
  }

  private buildNotes(
    providerNotes: string[],
    input: {
      usedFallback: boolean;
      mrp: number | null;
      confidence: number;
    }
  ) {
    const notes = [...providerNotes];

    if (!input.mrp) {
      notes.push("Price was not confidently detected. Please verify MRP manually.");
    }

    if (input.confidence < 0.6) {
      notes.push("Catalog confidence is low. Confirm carefully before saving.");
    }

    if (input.usedFallback) {
      notes.push("Local fallback handled this upload because the external AI provider was unavailable.");
    }

    return notes;
  }
}

export const onboardingService = new OnboardingService();
