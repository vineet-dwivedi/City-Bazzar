import { catalogService } from "./catalog.service.js";
import { ProductDiscoveryResult, Shop } from "../types.js";
import { dataStore } from "./store.js";
import { haversineDistanceKm } from "../utils/geo.js";
import { normalizeText } from "../utils/text.js";

class DiscoveryService {
  async listShops(options: {
    lat?: number;
    lng?: number;
    radiusKm?: number;
    query?: string;
  }) {
    const allShops = await dataStore.listShops();
    const shops = allShops.map((shop) =>
      this.enrichShopWithDistance(shop, options.lat, options.lng)
    );
    const filteredByDistance = options.lat !== undefined && options.lng !== undefined
      ? shops.filter((shop) => shop.distanceKm <= (options.radiusKm ?? shop.serviceRadiusKm))
      : shops;

    if (!options.query) {
      return filteredByDistance.sort((left, right) => left.distanceKm - right.distanceKm);
    }

    const normalizedQuery = normalizeText(options.query);
    const inventory = await dataStore.listInventoryItems();
    const products = await dataStore.listCatalogProducts();
    const productMap = new Map(products.map((product) => [product.id, product]));

    return filteredByDistance
      .filter((shop) => {
        const shopInventory = inventory.filter((item) => item.shopId === shop.id);
        return shopInventory.some((item) => {
          const product = productMap.get(item.productId);
          return product && normalizeText(`${product.name} ${product.brand}`).includes(normalizedQuery);
        });
      })
      .sort((left, right) => left.distanceKm - right.distanceKm);
  }

  async searchProducts(options: {
    query: string;
    lat: number;
    lng: number;
    radiusKm: number;
  }) {
    const matches = await catalogService.search(options.query, 12);
    const nearbyShops = await this.listShops({
      lat: options.lat,
      lng: options.lng,
      radiusKm: options.radiusKm
    });
    const allInventory = await dataStore.listInventoryItems();

    const results: ProductDiscoveryResult[] = matches
      .map(({ product }) => {
        const nearbyInventory = allInventory
          .filter((item) => item.productId === product.id && item.stockStatus !== "out_of_stock")
          .map((item) => {
            const shop = nearbyShops.find((candidate) => candidate.id === item.shopId);

            if (!shop) {
              return null;
            }

            return {
              shopId: shop.id,
              shopName: shop.name,
              address: shop.address,
              type: shop.type,
              distanceKm: shop.distanceKm,
              stockStatus: item.stockStatus,
              price: item.price,
              mrp: item.mrp,
              quantity: item.quantity
            };
          })
          .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
          .sort((left, right) => left.distanceKm - right.distanceKm);

        if (nearbyInventory.length === 0) {
          return null;
        }

        return {
          product,
          nearbyShops: nearbyInventory
        };
      })
      .filter((entry): entry is ProductDiscoveryResult => entry !== null);

    await Promise.all(
      uniqueShopIds(results).map((shopId) =>
        dataStore.incrementShopAnalytics(shopId, { searchHits: 1 })
      )
    );

    await dataStore.createSearchLog({
      query: options.query,
      normalizedQuery: normalizeText(options.query),
      lat: options.lat,
      lng: options.lng,
      radiusKm: options.radiusKm,
      resultCount: results.length
    });
    await dataStore.createAnalyticsEvent({
      eventType: "search",
      metadata: {
        query: options.query,
        resultCount: results.length
      }
    });

    return {
      query: options.query,
      location: {
        lat: options.lat,
        lng: options.lng,
        radiusKm: options.radiusKm
      },
      totalMatches: results.length,
      results
    };
  }

  private enrichShopWithDistance(shop: Shop, lat?: number, lng?: number) {
    if (lat === undefined || lng === undefined) {
      return { ...shop, distanceKm: 0 };
    }

    return {
      ...shop,
      distanceKm: haversineDistanceKm(lat, lng, shop.latitude, shop.longitude)
    };
  }
}

export const discoveryService = new DiscoveryService();

const uniqueShopIds = (results: ProductDiscoveryResult[]) => {
  const ids = new Set<string>();

  for (const result of results) {
    for (const shop of result.nearbyShops) {
      ids.add(shop.shopId);
    }
  }

  return [...ids];
};
