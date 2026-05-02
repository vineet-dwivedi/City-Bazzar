// Mongo store mirrors the memory-store contract with persistent collections.
import { randomUUID } from "node:crypto";
import { Db, MongoClient } from "mongodb";
import { DEFAULT_DB_NAME } from "../config.js";
import { createSeedState } from "./seed.js";
import {
  toCatalogProduct,
  toCatalogProductRecord,
  toInventoryItem,
  toInventoryItemRecord,
  toPickupIntent,
  toPickupIntentRecord,
  toShop,
  toShopRecord,
  toUser
} from "./mappers.js";
import { uniqueStrings } from "../utils/text.js";
import {
  AiOnboardingSessionRecord,
  AnalyticsEventRecord,
  CatalogProductRecord,
  InventoryItemRecord,
  PickupIntentRecord,
  SearchLogRecord,
  ShopRecord,
  UserRecord
} from "../persistence.types.js";
import {
  AnalyticsEventCreateInput,
  CatalogProductCreateInput,
  DataStore,
  InventoryItemUpsertInput,
  OnboardingSessionCreateInput,
  OnboardingSessionUpdateInput,
  PickupIntentCreateInput,
  SearchLogCreateInput,
  ShopProfileUpdateInput,
  ShopRegistrationInput,
  UserCreateInput
} from "./store.types.js";
import { CatalogProduct, PickupIntent, Shop, User } from "../types.js";
import { slugify } from "../utils/slug.js";

const getMongoDb = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is required when DATA_STORE_MODE=mongo.");
  }

  const client = new MongoClient(uri);
  await client.connect();
  return client.db(process.env.MONGODB_DB_NAME ?? DEFAULT_DB_NAME);
};

export class MongoDataStore implements DataStore {
  readonly mode = "mongo" as const;
  private database?: Db;

  async initialize() {
    if (this.database) {
      return;
    }

    // Initialization is lazy so tests and scripts only connect when needed.
    this.database = await getMongoDb();
    await this.ensureIndexes();
    await this.seedIfNeeded();
  }

  // User methods
  async createUser(input: UserCreateInput) {
    const now = new Date().toISOString();
    const record: UserRecord = {
      _id: `user-${randomUUID()}`,
      role: input.role,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      passwordHash: input.passwordHash,
      isVerified: true,
      status: "active",
      createdAt: now,
      updatedAt: now
    };

    await this.users().insertOne(record);
    return toUser(record);
  }

  async findUserById(userId: string) {
    const record = await this.users().findOne({ _id: userId });
    return record ? toUser(record) : undefined;
  }

  async findUserByEmail(email: string) {
    const record = await this.users().findOne({ email: email.toLowerCase() });
    return record ? toUser(record) : undefined;
  }

  async findUserByPhone(phone: string) {
    const record = await this.users().findOne({ phone });
    return record ? toUser(record) : undefined;
  }

  async getPasswordHash(userId: string) {
    const record = await this.users().findOne({ _id: userId }, { projection: { passwordHash: 1 } });
    return record?.passwordHash;
  }

  async touchUserLogin(userId: string) {
    const now = new Date().toISOString();
    await this.users().updateOne(
      { _id: userId },
      {
        $set: {
          lastLoginAt: now,
          updatedAt: now
        }
      }
    );
  }

  // Shop methods
  async listShops() {
    const records = await this.shops().find({}).toArray();
    return records.map(toShop);
  }

  async createShop(input: ShopRegistrationInput) {
    const shop: Shop = {
      id: `shop-${randomUUID()}`,
      ownerUserId: input.ownerUserId,
      name: input.name,
      type: input.type,
      ownerName: input.ownerName,
      phone: input.phone,
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      serviceRadiusKm: input.serviceRadiusKm ?? 5,
      analytics: {
        views: 0,
        clicks: 0,
        searchHits: 0
      },
      createdAt: new Date().toISOString()
    };

    const record = toShopRecord(shop);
    record.slug = this.ensureUniqueSlug(slugify(input.name), shop.id);
    record.metricsSummary.inventoryCount = 0;

    await this.shops().insertOne(record);
    return shop;
  }

  async findShopById(shopId: string) {
    const record = await this.shops().findOne({ _id: shopId });
    return record ? toShop(record) : undefined;
  }

  async findShopByOwnerId(ownerUserId: string) {
    const record = await this.shops().findOne({ ownerUserId });
    return record ? toShop(record) : undefined;
  }

  async updateShop(shopId: string, input: ShopProfileUpdateInput) {
    const current = await this.shops().findOne({ _id: shopId });

    if (!current) {
      return undefined;
    }

    const updatePayload: Partial<ShopRecord> = {
      updatedAt: new Date().toISOString()
    };

    if (input.name !== undefined) {
      updatePayload.name = input.name;
      updatePayload.slug = this.ensureUniqueSlug(slugify(input.name), shopId);
    }

    if (input.type !== undefined) {
      updatePayload.type = input.type;
    }

    if (input.ownerName !== undefined) {
      updatePayload.contactName = input.ownerName;
    }

    if (input.phone !== undefined) {
      updatePayload.phone = input.phone;
    }

    if (input.address !== undefined) {
      updatePayload.address = {
        ...current.address,
        line1: input.address,
        formattedAddress: input.address
      };
    }

    if (input.latitude !== undefined || input.longitude !== undefined) {
      updatePayload.location = {
        type: "Point",
        coordinates: [
          input.longitude ?? current.location.coordinates[0],
          input.latitude ?? current.location.coordinates[1]
        ]
      };
    }

    if (input.serviceRadiusKm !== undefined) {
      updatePayload.serviceRadiusKm = input.serviceRadiusKm;
    }

    await this.shops().updateOne(
      { _id: shopId },
      {
        $set: updatePayload
      }
    );

    const updated = await this.shops().findOne({ _id: shopId });
    return updated ? toShop(updated) : undefined;
  }

  async incrementShopAnalytics(shopId: string, delta: Partial<Shop["analytics"]>) {
    const incrementPayload: Record<string, number> = {};

    if (delta.views) {
      incrementPayload["metricsSummary.views"] = delta.views;
    }

    if (delta.clicks) {
      incrementPayload["metricsSummary.clicks"] = delta.clicks;
    }

    if (delta.searchHits) {
      incrementPayload["metricsSummary.searchHits"] = delta.searchHits;
    }

    await this.shops().updateOne(
      { _id: shopId },
      {
        ...(Object.keys(incrementPayload).length > 0 ? { $inc: incrementPayload } : {}),
        $set: { updatedAt: new Date().toISOString() }
      }
    );

    const record = await this.shops().findOne({ _id: shopId });
    return record ? toShop(record) : undefined;
  }

  // Catalog methods
  async listCatalogProducts() {
    const records = await this.catalogProducts().find({}).toArray();
    return records.map(toCatalogProduct);
  }

  async findCatalogProductById(productId: string) {
    const record = await this.catalogProducts().findOne({ _id: productId });
    return record ? toCatalogProduct(record) : undefined;
  }

  async createCatalogProduct(input: CatalogProductCreateInput) {
    const product: CatalogProduct = {
      id: `prod-${randomUUID()}`,
      name: input.name,
      brand: input.brand,
      category: input.category,
      unit: input.unit ?? "1 unit",
      defaultMrp: input.mrp ?? 0,
      keywords: uniqueStrings(input.keywords ?? []),
      imageHints: uniqueStrings(input.imageHints ?? []),
      createdAt: new Date().toISOString()
    };

    await this.catalogProducts().insertOne(toCatalogProductRecord(product));
    return product;
  }

  // Inventory methods
  async listInventoryItems() {
    const records = await this.inventoryItems().find({}).toArray();
    return records.map(toInventoryItem);
  }

  async listInventoryByShop(shopId: string) {
    const records = await this.inventoryItems().find({ shopId }).toArray();
    return records.map(toInventoryItem);
  }

  async findInventoryItem(shopId: string, productId: string) {
    const record = await this.inventoryItems().findOne({
      shopId,
      catalogProductId: productId
    });

    return record ? toInventoryItem(record) : undefined;
  }

  async upsertInventoryItem(input: InventoryItemUpsertInput) {
    const existing = await this.inventoryItems().findOne({
      shopId: input.shopId,
      catalogProductId: input.productId
    });

    if (existing) {
      const updatedAt = new Date().toISOString();
      await this.inventoryItems().updateOne(
        { _id: existing._id },
        {
          $set: {
            stockStatus: input.stockStatus,
            quantity: input.quantity,
            price: input.price,
            mrp: input.mrp,
            imageUrls: input.imageUrl ? [input.imageUrl] : [],
            source: input.source ?? existing.source,
            lastConfirmedAt: updatedAt,
            updatedAt
          }
        }
      );

      await this.refreshInventoryCount(input.shopId);
      const updated = await this.inventoryItems().findOne({ _id: existing._id });

      if (!updated) {
        throw new Error("Inventory update failed.");
      }

      return toInventoryItem(updated);
    }

    const product = await this.findCatalogProductById(input.productId);

    if (!product) {
      throw new Error("Catalog product not found while creating inventory.");
    }

    const createdAt = new Date().toISOString();
    const record = toInventoryItemRecord(
      {
        id: `inv-${randomUUID()}`,
        shopId: input.shopId,
        productId: input.productId,
        stockStatus: input.stockStatus,
        quantity: input.quantity,
        price: input.price,
        mrp: input.mrp,
        imageUrl: input.imageUrl,
        lastUpdatedAt: createdAt
      },
      product.name
    );

    record.source = input.source ?? "manual";
    record.lastConfirmedAt = createdAt;
    await this.inventoryItems().insertOne(record);
    await this.refreshInventoryCount(input.shopId);
    return toInventoryItem(record);
  }

  async deleteInventoryItem(shopId: string, productId: string) {
    const result = await this.inventoryItems().deleteOne({
      shopId,
      catalogProductId: productId
    });

    if (result.deletedCount > 0) {
      await this.refreshInventoryCount(shopId);
      return true;
    }

    return false;
  }

  // Tracking methods
  async createOnboardingSession(input: OnboardingSessionCreateInput) {
    const now = new Date().toISOString();
    const sessionId = `onb-${randomUUID()}`;

    await this.onboardingSessions().insertOne({
      _id: sessionId,
      shopId: input.shopId ?? "guest-shop",
      createdByUserId: input.createdByUserId ?? "guest-user",
      sourceImageUrl: input.sourceImageUrl,
      rawOcrText: input.rawOcrText,
      manualHint: input.manualHint,
      analysis: input.analysis,
      status: "analyzed",
      createdAt: now,
      updatedAt: now
    });

    return sessionId;
  }

  async updateOnboardingSession(input: OnboardingSessionUpdateInput) {
    await this.onboardingSessions().updateOne(
      { _id: input.sessionId },
      {
        $set: {
          status: input.status,
          acceptedCatalogProductId: input.acceptedCatalogProductId,
          ownerCorrections: input.ownerCorrections,
          updatedAt: new Date().toISOString()
        }
      }
    );
  }

  async createSearchLog(input: SearchLogCreateInput) {
    await this.searchLogs().insertOne({
      _id: `search-${randomUUID()}`,
      actorUserId: input.actorUserId,
      query: input.query,
      normalizedQuery: input.normalizedQuery,
      location:
        input.lat !== undefined && input.lng !== undefined
          ? {
              lat: input.lat,
              lng: input.lng
            }
          : undefined,
      radiusKm: input.radiusKm,
      resultCount: input.resultCount,
      selectedShopId: input.selectedShopId,
      selectedCatalogProductId: input.selectedCatalogProductId,
      searchAt: new Date().toISOString()
    });
  }

  async createAnalyticsEvent(input: AnalyticsEventCreateInput) {
    await this.analyticsEvents().insertOne({
      _id: `evt-${randomUUID()}`,
      eventType: input.eventType,
      actorUserId: input.actorUserId,
      shopId: input.shopId,
      catalogProductId: input.catalogProductId,
      inventoryItemId: input.inventoryItemId,
      sessionId: input.sessionId,
      metadata: input.metadata,
      createdAt: new Date().toISOString()
    });
  }

  async createPickupIntent(input: PickupIntentCreateInput) {
    const now = new Date().toISOString();
    const intent: PickupIntent = {
      id: `pick-${randomUUID()}`,
      shopId: input.shopId,
      productId: input.productId,
      inventoryItemId: input.inventoryItemId,
      customerUserId: input.customerUserId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      quantityRequested: input.quantityRequested,
      note: input.note,
      status: "requested",
      createdAt: now,
      updatedAt: now
    };

    await this.pickupIntents().insertOne(toPickupIntentRecord(intent));
    return intent;
  }

  async findPickupIntentById(intentId: string) {
    const record = await this.pickupIntents().findOne({ _id: intentId });
    return record ? toPickupIntent(record) : undefined;
  }

  async listPickupIntentsByShop(shopId: string) {
    const records = await this.pickupIntents().find({ shopId }).sort({ createdAt: -1 }).toArray();
    return records.map(toPickupIntent);
  }

  async listPickupIntentsByCustomer(input: {
    customerUserId?: string;
    customerPhone?: string;
  }) {
    const filters: Array<
      | { customerUserId: string }
      | { customerPhone: string }
    > = [];

    if (input.customerUserId) {
      filters.push({ customerUserId: input.customerUserId });
    }

    if (input.customerPhone) {
      filters.push({ customerPhone: input.customerPhone });
    }

    if (filters.length === 0) {
      return [];
    }

    const records = await this.pickupIntents().find({ $or: filters }).sort({ createdAt: -1 }).toArray();
    return records.map(toPickupIntent);
  }

  async updatePickupIntentStatus(intentId: string, status: PickupIntent["status"]) {
    await this.pickupIntents().updateOne(
      { _id: intentId },
      {
        $set: {
          status,
          updatedAt: new Date().toISOString()
        }
      }
    );

    const updated = await this.pickupIntents().findOne({ _id: intentId });
    return updated ? toPickupIntent(updated) : undefined;
  }

  private async refreshInventoryCount(shopId: string) {
    // Inventory count is kept on the shop for quick dashboard reads.
    const inventoryCount = await this.inventoryItems().countDocuments({ shopId });

    await this.shops().updateOne(
      { _id: shopId },
      {
        $set: {
          "metricsSummary.inventoryCount": inventoryCount,
          "metricsSummary.lastInventoryUpdateAt": new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    );
  }

  private async ensureIndexes() {
    // Keep indexes close to the store so collection behavior is obvious.
    await this.users().createIndex({ email: 1 }, { unique: true, sparse: true });
    await this.users().createIndex({ phone: 1 }, { unique: true, sparse: true });
    await this.shops().createIndex({ slug: 1 }, { unique: true });
    await this.shops().createIndex({ ownerUserId: 1 });
    await this.shops().createIndex({ location: "2dsphere" });
    await this.catalogProducts().createIndex({ normalizedName: 1 });
    await this.catalogProducts().createIndex({ brand: 1 });
    await this.inventoryItems().createIndex(
      { shopId: 1, catalogProductId: 1 },
      { unique: true }
    );
    await this.pickupIntents().createIndex({ shopId: 1, status: 1, createdAt: -1 });
    await this.searchLogs().createIndex({ normalizedQuery: 1 });
    await this.analyticsEvents().createIndex({ eventType: 1, createdAt: -1 });
  }

  private async seedIfNeeded() {
    if (process.env.MONGODB_SEED_ON_START === "false") {
      return;
    }

    // Seed only when the database is empty so restarts stay idempotent.
    const existingShopCount = await this.shops().countDocuments();

    if (existingShopCount > 0) {
      return;
    }

    const seed = createSeedState();
    const productRecords = seed.catalogProducts.map(toCatalogProductRecord);
    const shopRecords = seed.shops.map((shop) => {
      const record = toShopRecord(shop);
      const inventoryCount = seed.inventory.filter((item) => item.shopId === shop.id).length;
      record.metricsSummary.inventoryCount = inventoryCount;
      return record;
    });
    const inventoryRecords = seed.inventory.map((item) => {
      const product = seed.catalogProducts.find((entry) => entry.id === item.productId);
      return toInventoryItemRecord(item, product?.name ?? item.productId);
    });

    if (productRecords.length > 0) {
      await this.catalogProducts().insertMany(productRecords);
    }

    if (shopRecords.length > 0) {
      await this.shops().insertMany(shopRecords);
    }

    if (inventoryRecords.length > 0) {
      await this.inventoryItems().insertMany(inventoryRecords);
    }
  }

  private ensureUniqueSlug(baseSlug: string, fallbackId: string) {
    const normalized = baseSlug || fallbackId;
    return `${normalized}-${fallbackId.slice(-6)}`;
  }

  // Collection helpers
  private db() {
    if (!this.database) {
      throw new Error("Mongo store has not been initialized.");
    }

    return this.database;
  }

  private shops() {
    return this.db().collection<ShopRecord>("shops");
  }

  private users() {
    return this.db().collection<UserRecord>("users");
  }

  private catalogProducts() {
    return this.db().collection<CatalogProductRecord>("catalog_products");
  }

  private inventoryItems() {
    return this.db().collection<InventoryItemRecord>("inventory_items");
  }

  private onboardingSessions() {
    return this.db().collection<AiOnboardingSessionRecord>("ai_onboarding_sessions");
  }

  private searchLogs() {
    return this.db().collection<SearchLogRecord>("search_logs");
  }

  private analyticsEvents() {
    return this.db().collection<AnalyticsEventRecord>("analytics_events");
  }

  private pickupIntents() {
    return this.db().collection<PickupIntentRecord>("pickup_intents");
  }
}
