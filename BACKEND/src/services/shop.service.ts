// Shop service holds the main business rules for shops and inventory.
import {
  AnalyticsEventType,
  ProductCategory,
  ShopType,
  StockStatus
} from "../types.js";
import { catalogService } from "./catalog.service.js";
import { dataStore } from "./store.js";
import { ShopProfileUpdateInput } from "../data/store.types.js";

class ShopService {
  async registerShop(input: {
    name: string;
    type: ShopType;
    ownerName: string;
    phone: string;
    address: string;
    latitude: number;
    longitude: number;
    serviceRadiusKm?: number;
  }) {
    return dataStore.createShop(input);
  }

  async registerOwnedShop(ownerUserId: string, input: {
    name: string;
    type: ShopType;
    ownerName: string;
    phone: string;
    address: string;
    latitude: number;
    longitude: number;
    serviceRadiusKm?: number;
  }) {
    const existing = await dataStore.findShopByOwnerId(ownerUserId);

    if (existing) {
      return null;
    }

    return dataStore.createShop({
      ...input,
      ownerUserId
    });
  }

  async getShop(shopId: string) {
    // Public shop reads are enriched with product details for convenience.
    const shop = await dataStore.findShopById(shopId);

    if (!shop) {
      return null;
    }

    const inventory = await dataStore.listInventoryByShop(shopId);
    const inventoryWithProducts = await Promise.all(
      inventory.map(async (item) => ({
        ...item,
        product: await catalogService.findById(item.productId)
      }))
    );

    return { ...shop, inventory: inventoryWithProducts };
  }

  async getOwnedShop(ownerUserId: string) {
    const shop = await dataStore.findShopByOwnerId(ownerUserId);

    if (!shop) {
      return null;
    }

    return this.getShop(shop.id);
  }

  async updateOwnedShop(ownerUserId: string, input: ShopProfileUpdateInput) {
    const shop = await dataStore.findShopByOwnerId(ownerUserId);

    if (!shop) {
      return null;
    }

    return dataStore.updateShop(shop.id, input);
  }

  async recordEvent(shopId: string, type: AnalyticsEventType) {
    const increment =
      type === "view"
        ? { views: 1 }
        : { clicks: 1 };

    const shop = await dataStore.incrementShopAnalytics(shopId, increment);

    if (!shop) {
      return null;
    }

    await dataStore.createAnalyticsEvent({
      eventType: type,
      shopId
    });

    return shop.analytics;
  }

  async getAnalytics(shopId: string) {
    const shop = await dataStore.findShopById(shopId);

    if (!shop) {
      return null;
    }

    const inventoryCount = (await dataStore.listInventoryByShop(shopId)).length;
    const pickupIntentCount = (await dataStore.listPickupIntentsByShop(shopId)).length;
    return {
      ...shop.analytics,
      inventoryCount,
      pickupIntentCount
    };
  }

  async updateShopProfile(shopId: string, input: ShopProfileUpdateInput) {
    return dataStore.updateShop(shopId, input);
  }

  async upsertInventoryItem(shopId: string, input: {
    productId: string;
    stockStatus: StockStatus;
    quantity: number;
    price: number;
    mrp: number;
    imageUrl?: string;
  }) {
    const shop = await dataStore.findShopById(shopId);
    const product = await catalogService.findById(input.productId);

    if (!shop || !product) {
      return null;
    }

    const inventoryItem = await dataStore.upsertInventoryItem({
      shopId,
      productId: input.productId,
      stockStatus: input.stockStatus,
      quantity: input.quantity,
      price: input.price,
      mrp: input.mrp,
      imageUrl: input.imageUrl,
      source: "manual"
    });

    await dataStore.createAnalyticsEvent({
      eventType: "inventory_added",
      shopId,
      catalogProductId: input.productId,
      inventoryItemId: inventoryItem.id
    });

    return inventoryItem;
  }

  async deleteInventoryItem(shopId: string, productId: string) {
    return dataStore.deleteInventoryItem(shopId, productId);
  }

  async getOwnedInventory(ownerUserId: string) {
    const shop = await dataStore.findShopByOwnerId(ownerUserId);

    if (!shop) {
      return null;
    }

    return dataStore.listInventoryByShop(shop.id);
  }

  async upsertOwnedInventoryItem(ownerUserId: string, input: {
    productId: string;
    stockStatus: StockStatus;
    quantity: number;
    price: number;
    mrp: number;
    imageUrl?: string;
  }) {
    const shop = await dataStore.findShopByOwnerId(ownerUserId);

    if (!shop) {
      return null;
    }

    return this.upsertInventoryItem(shop.id, input);
  }

  async deleteOwnedInventoryItem(ownerUserId: string, productId: string) {
    const shop = await dataStore.findShopByOwnerId(ownerUserId);

    if (!shop) {
      return false;
    }

    return dataStore.deleteInventoryItem(shop.id, productId);
  }

  async confirmOnboarding(input: {
    shopId: string;
    catalogProductId?: string;
    onboardingSessionId?: string;
    name: string;
    brand: string;
    category: ProductCategory;
    mrp?: number | null;
    price?: number | null;
    quantity?: number;
    stockStatus?: StockStatus;
    imageUrl?: string;
    keywords?: string[];
  }) {
    // Confirm either links an existing catalog product or creates a new one.
    const shop = await dataStore.findShopById(input.shopId);

    if (!shop) {
      return null;
    }

    const existingProduct = input.catalogProductId
      ? await catalogService.findById(input.catalogProductId)
      : undefined;

    const product =
      existingProduct ??
      await catalogService.createProduct({
        name: input.name,
        brand: input.brand,
        category: input.category,
        mrp: input.mrp,
        keywords: input.keywords,
        imageHints: input.imageUrl ? [input.imageUrl] : []
      });

    const inventoryItem = await dataStore.upsertInventoryItem({
      shopId: input.shopId,
      productId: product.id,
      stockStatus: input.stockStatus ?? "in_stock",
      quantity: input.quantity ?? 1,
      price: input.price ?? input.mrp ?? product.defaultMrp,
      mrp: input.mrp ?? product.defaultMrp,
      imageUrl: input.imageUrl,
      source: "ai_assisted"
    });

    if (!inventoryItem) {
      return null;
    }

    if (input.onboardingSessionId) {
      await dataStore.updateOnboardingSession({
        sessionId: input.onboardingSessionId,
        status: "confirmed",
        acceptedCatalogProductId: product.id,
        ownerCorrections: {
          name: input.name,
          brand: input.brand,
          category: input.category,
          mrp: input.mrp ?? null,
          price: input.price ?? null
        }
      });
    }

    await dataStore.createAnalyticsEvent({
      eventType: "inventory_added",
      shopId: input.shopId,
      catalogProductId: product.id,
      inventoryItemId: inventoryItem.id,
      sessionId: input.onboardingSessionId
    });

    return {
      product,
      inventoryItem
    };
  }
}

export const shopService = new ShopService();
