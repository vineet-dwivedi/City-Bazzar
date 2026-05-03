import { ProductCategory } from "../../types.js";
import { extractPrice, normalizeText, titleCase, tokenize, uniqueStrings } from "../../utils/text.js";

const categoryHints: Record<ProductCategory, string[]> = {
  grocery: ["atta", "rice", "dal", "oil", "maggi", "noodles", "milk"],
  stationery: ["notebook", "pen", "pencil", "eraser", "copy", "classmate"],
  pharmacy: ["tablet", "medicine", "syrup", "crocin", "paracetamol"],
  "personal-care": ["toothpaste", "soap", "shampoo", "sanitizer", "cream"],
  beverages: ["juice", "milk", "drink", "tea", "coffee"],
  snacks: ["chips", "biscuits", "cookies", "namkeen", "snack"],
  household: ["detergent", "cleaner", "mop", "utensil", "wash"]
};

// Keeps extraction rules explicit and easy to replace with a model later.
export class LocalExtractionProvider {
  inferCategory(text: string): ProductCategory {
    const normalized = normalizeText(text);
    const entry = Object.entries(categoryHints).find(([, hints]) =>
      hints.some((hint) => normalized.includes(hint))
    );

    return (entry?.[0] as ProductCategory | undefined) ?? "grocery";
  }

  extract(input: {
    text: string;
    fallbackBrand?: string;
    fallbackCategory?: ProductCategory;
    fallbackName?: string;
  }) {
    const normalized = normalizeText(input.text);
    const category = input.fallbackCategory ?? this.inferCategory(normalized);
    const brand = input.fallbackBrand ?? "Local Brand";
    const name = input.fallbackName ?? this.inferProductName(normalized, brand, category);
    const mrp = extractPrice(input.text);

    return {
      name,
      brand,
      category,
      mrp,
      price: mrp,
      keywords: uniqueStrings([brand.toLowerCase(), category, ...tokenize(normalized)]).slice(0, 8)
    };
  }

  private inferProductName(text: string, brand: string, category: ProductCategory) {
    const meaningfulTokens = tokenize(text).filter((token) => token.length > 2);
    return meaningfulTokens.length === 0
      ? titleCase(`${brand} ${category}`)
      : titleCase(meaningfulTokens.slice(0, 4).join(" "));
  }
}
