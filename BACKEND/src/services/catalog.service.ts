// Catalog service is the thin layer around shared product data.
import { dataStore } from "./store.js";
import { CatalogSearchMatch, ProductCategory } from "../types.js";
import { scoreAgainstQuery } from "../utils/text.js";

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
}

export const catalogService = new CatalogService();
