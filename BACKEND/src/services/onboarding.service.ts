// Onboarding service keeps the MVP AI flow local and easy to swap later.
import { catalogService } from "./catalog.service.js";
import { OnboardingAnalysis, ProductCategory } from "../types.js";
import { dataStore } from "./store.js";
import { extractPrice, normalizeText, titleCase, tokenize, uniqueStrings } from "../utils/text.js";

const categoryHints: Record<ProductCategory, string[]> = {
  grocery: ["atta", "rice", "dal", "oil", "maggi", "noodles", "milk"],
  stationery: ["notebook", "pen", "pencil", "eraser", "copy", "classmate"],
  pharmacy: ["tablet", "medicine", "syrup", "crocin", "paracetamol"],
  "personal-care": ["toothpaste", "soap", "shampoo", "sanitizer", "cream"],
  beverages: ["juice", "milk", "drink", "tea", "coffee"],
  snacks: ["chips", "biscuits", "cookies", "namkeen", "snack"],
  household: ["detergent", "cleaner", "mop", "utensil", "wash"]
};

class OnboardingService {
  async analyze(input: {
    imageUrl: string;
    rawText?: string;
    manualHint?: string;
    shopId?: string;
  }): Promise<OnboardingAnalysis> {
    // We combine OCR text, owner hints, and file-name hints into one rough prompt.
    const imageHint = input.imageUrl.split("/").pop()?.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]/g, " ") ?? "";
    const combinedText = [input.rawText, input.manualHint, imageHint].filter(Boolean).join(" ").trim();
    const normalized = normalizeText(combinedText);

    const catalogMatches = await catalogService.search(normalized, 1);
    const bestMatch = catalogMatches[0];
    const inferredBrand = bestMatch?.product.brand ?? (await this.inferBrand(normalized)) ?? "Local Brand";
    const inferredCategory = bestMatch?.product.category ?? this.inferCategory(normalized);
    const detectedMrp = extractPrice(combinedText);
    const inferredName =
      bestMatch?.product.name ?? this.inferProductName(normalized, inferredBrand, inferredCategory);
    const confidence = bestMatch?.score ?? Math.min(0.45, tokenize(normalized).length * 0.1);
    const notes: string[] = [];

    if (!input.rawText) {
      notes.push("OCR text not provided yet, so the analysis relies mostly on image naming hints.");
    }

    if (!detectedMrp) {
      notes.push("Price was not confidently detected. Shop owner should verify MRP manually.");
    }

    if (confidence < 0.6) {
      notes.push("Low catalog confidence. Treat this as a new catalog candidate unless the owner confirms a match.");
    }

    const analysis: OnboardingAnalysis = {
      source: {
        imageUrl: input.imageUrl,
        combinedText
      },
      extracted: {
        name: inferredName,
        brand: inferredBrand,
        category: inferredCategory,
        mrp: detectedMrp,
        price: detectedMrp,
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
      suggestedKeywords: this.buildSuggestedKeywords(normalized, inferredBrand, inferredCategory),
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

  private async inferBrand(text: string) {
    const products = await catalogService.list();
    const product = products.find((item) => {
      const brandToken = normalizeText(item.brand);
      return brandToken && text.includes(brandToken);
    });

    return product?.brand;
  }

  private inferCategory(text: string): ProductCategory {
    const entry = Object.entries(categoryHints).find(([, hints]) =>
      hints.some((hint) => text.includes(hint))
    );

    return (entry?.[0] as ProductCategory | undefined) ?? "grocery";
  }

  private inferProductName(text: string, brand: string, category: ProductCategory) {
    const meaningfulTokens = tokenize(text).filter((token) => token.length > 2);

    if (meaningfulTokens.length === 0) {
      return titleCase(`${brand} ${category}`);
    }

    return titleCase(meaningfulTokens.slice(0, 4).join(" "));
  }

  private buildSuggestedKeywords(text: string, brand: string, category: ProductCategory) {
    return uniqueStrings([brand.toLowerCase(), category, ...tokenize(text)]).slice(0, 8);
  }
}

export const onboardingService = new OnboardingService();
