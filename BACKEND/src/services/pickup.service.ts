// Pickup service connects customer intent to a real shop inventory item.
import { dataStore } from "./store.js";
import { notFound } from "../utils/api-error.js";

class PickupService {
  async createIntent(input: {
    shopId: string;
    productId: string;
    customerName: string;
    customerPhone: string;
    quantityRequested: number;
    note?: string;
    customerUserId?: string;
  }) {
    // A pickup request is valid only if the shop still has the exact product listed.
    const [shop, product, inventoryItem] = await Promise.all([
      dataStore.findShopById(input.shopId),
      dataStore.findCatalogProductById(input.productId),
      dataStore.findInventoryItem(input.shopId, input.productId)
    ]);

    if (!shop || !product || !inventoryItem) {
      throw notFound("Shop product is not available for pickup.");
    }

    const intent = await dataStore.createPickupIntent({
      ...input,
      inventoryItemId: inventoryItem.id
    });

    await dataStore.createAnalyticsEvent({
      eventType: "pickup_intent",
      actorUserId: input.customerUserId,
      shopId: input.shopId,
      catalogProductId: input.productId,
      inventoryItemId: inventoryItem.id,
      metadata: {
        quantityRequested: input.quantityRequested
      }
    });

    return {
      ...intent,
      shop,
      product
    };
  }

  async listShopIntents(shopId: string) {
    const intents = await dataStore.listPickupIntentsByShop(shopId);

    return Promise.all(
      intents.map(async (intent) => ({
        ...intent,
        product: await dataStore.findCatalogProductById(intent.productId)
      }))
    );
  }

  async listCustomerIntents(input: {
    customerUserId?: string;
    customerPhone?: string;
  }) {
    const intents = await dataStore.listPickupIntentsByCustomer(input);

    return Promise.all(
      intents.map(async (intent) => ({
        ...intent,
        shop: await dataStore.findShopById(intent.shopId),
        product: await dataStore.findCatalogProductById(intent.productId),
      }))
    );
  }

  async updateIntentStatus(shopId: string, intentId: string, status: Parameters<typeof dataStore.updatePickupIntentStatus>[1]) {
    const current = await dataStore.findPickupIntentById(intentId);

    if (!current || current.shopId !== shopId) {
      return null;
    }

    return dataStore.updatePickupIntentStatus(intentId, status);
  }
}

export const pickupService = new PickupService();
