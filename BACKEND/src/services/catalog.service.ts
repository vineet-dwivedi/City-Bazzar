// Catalog service is the thin layer around shared product data.
import { dataStore } from "./store.js";
import { CatalogProduct, CatalogSearchMatch, ProductCategory } from "../types.js";
import { normalizeText, scoreAgainstQuery, tokenize, uniqueStrings } from "../utils/text.js";

type CatalogResolveInput = {
  name: string;
  brand: string;
  category: ProductCategory;
  unit?: string;
  mrp?: number | null;
  keywords?: string[];
  imageHints?: string[];
};

class CatalogService {
  async list() {
    return dataStore.listCatalogProducts();
  }

  async findById(id: string) {
    return dataStore.findCatalogProductById(id);
  }

  async search(query: string, limit = 8): Promise<CatalogSearchMatch[]> {
    // Matching stays heuristic for now so the MVP works without extra infra.
    const products = await dataStore.listCatalogProducts();

    const matches = products
      .map((product) => {
        const score = scoreAgainstQuery(query, [
          product.name,
          product.brand,
          ...product.keywords,
          ...product.imageHints
        ]);

        return { product, score };
      })
      .filter((match) => match.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, limit);

    return matches;
  }

  async createProduct(input: {
    name: string;
    brand: string;
    category: ProductCategory;
    unit?: string;
    mrp?: number | null;
    keywords?: string[];
    imageHints?: string[];
  }) {
    return dataStore.createCatalogProduct(input);
  }

  async findBestStructuredMatch(input: {
    name: string;
    brand?: string;
    category?: ProductCategory;
    keywords?: string[];
  }) {
    const products = await dataStore.listCatalogProducts();
    const matches = products
      .map((product) => ({
        product,
        score: this.scoreStructuredMatch(product, input)
      }))
      .filter((entry) => entry.score > 0.45)
      .sort((left, right) => right.score - left.score);

    return matches[0];
  }

  async resolveOrCreateProduct(input: CatalogResolveInput) {
    const match = await this.findBestStructuredMatch(input);

    if (match && match.score >= 0.82) {
      return {
        product: match.product,
        status: "linked_existing" as const,
        confidence: match.score
      };
    }

    const product = await this.createProduct({
      name: input.name,
      brand: input.brand,
      category: input.category,
      unit: input.unit,
      mrp: input.mrp,
      keywords: this.buildProductKeywords(input),
      imageHints: uniqueStrings(input.imageHints ?? []).slice(0, 4)
    });

    return {
      product,
      status: "created_new" as const,
      confidence: match?.score ?? 0
    };
  }

  private scoreStructuredMatch(
    product: CatalogProduct,
    input: {
      name: string;
      brand?: string;
      category?: ProductCategory;
      keywords?: string[];
    }
  ) {
    const normalizedName = normalizeText(input.name);
    const normalizedBrand = normalizeText(input.brand ?? "");
    const normalizedProductName = normalizeText(product.name);
    const normalizedProductBrand = normalizeText(product.brand);
    const combinedQuery = [normalizedBrand, normalizedName].filter(Boolean).join(" ");
    const searchable = [
      product.name,
      `${product.brand} ${product.name}`,
      ...product.keywords,
      ...product.imageHints
    ];
    let score = scoreAgainstQuery(combinedQuery || normalizedName, searchable);

    if (normalizedName && normalizedName === normalizedProductName) {
      score = Math.max(score, 0.88);
    }

    if (normalizedBrand && normalizedBrand === normalizedProductBrand) {
      score += 0.12;
    }

    if (input.category && input.category === product.category) {
      score += 0.06;
    }

    const inputKeywords = uniqueStrings(input.keywords?.flatMap((value) => tokenize(value)) ?? []);
    const keywordHits = inputKeywords.filter((token) => product.keywords.includes(token)).length;

    if (inputKeywords.length > 0) {
      score += Math.min(0.12, keywordHits / inputKeywords.length / 4);
    }

    return Number(Math.min(1, score).toFixed(2));
  }

  private buildProductKeywords(input: CatalogResolveInput) {
    return uniqueStrings([
      input.category,
      ...tokenize(input.name),
      ...tokenize(input.brand),
      ...(input.keywords ?? []).flatMap((value) => tokenize(value))
    ]).slice(0, 10);
  }
}

export const catalogService = new CatalogService();
