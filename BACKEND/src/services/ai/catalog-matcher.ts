import { catalogService } from "../catalog.service.js";
import { normalizeText } from "../../utils/text.js";

// Single place for brand/catalog lookup so future embedding logic lands cleanly.
export class CatalogMatcher {
  async match(text: string) {
    const normalized = normalizeText(text);
    const catalogMatches = await catalogService.search(normalized, 1);
    return catalogMatches[0];
  }

  async inferBrand(text: string) {
    const normalized = normalizeText(text);
    const products = await catalogService.list();
    const product = products.find((item) => {
      const brandToken = normalizeText(item.brand);
      return brandToken && normalized.includes(brandToken);
    });

    return product?.brand;
  }
}
