// In-memory store keeps local development fast and dependency-free.
import { randomUUID } from "node:crypto";
import { createSeedState } from "./seed.js";
import { CatalogProduct, InventoryItem, PickupIntent, Shop, User } from "../types.js";
import {
  AiOnboardingSessionRecord,
  AnalyticsEventRecord,
  PickupIntentRecord,
  SearchLogRecord,
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
import { uniqueStrings } from "../utils/text.js";

export class MemoryDataStore implements DataStore {
  readonly mode = "memory" as const;

  private readonly shops: Shop[];
  private readonly catalogProducts: CatalogProduct[];
  private readonly inventory: InventoryItem[];
  private readonly onboardingSessions: AiOnboardingSessionRecord[] = [];
  private readonly searchLogs: SearchLogRecord[] = [];
  private readonly analyticsEvents: AnalyticsEventRecord[] = [];
  private readonly pickupIntents: PickupIntentRecord[] = [];
  private readonly users: UserRecord[] = [];

  constructor() {
    const seed = createSeedState();
    this.shops = seed.shops;
    this.catalogProducts = seed.catalogProducts;
    this.inventory = seed.inventory;
  }

  async initialize() {
    return;
  }

  // User methods
  async createUser(input: UserCreateInput) {
    const now = new Date().toISOString();
    const user: UserRecord = {
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

    this.users.push(user);
    return this.toUser(user);
  }

  async findUserById(userId: string) {
    const user = this.users.find((entry) => entry._id === userId);
    return user ? this.toUser(user) : undefined;
  }

  async findUserByEmail(email: string) {
    const user = this.users.find((entry) => entry.email?.toLowerCase() === email.toLowerCase());
    return user ? this.toUser(user) : undefined;
  }

  async findUserByPhone(phone: string) {
    const user = this.users.find((entry) => entry.phone === phone);
    return user ? this.toUser(user) : undefined;
  }

  async getPasswordHash(userId: string) {
    return this.users.find((entry) => entry._id === userId)?.passwordHash;
  }

  async touchUserLogin(userId: string) {
    const user = this.users.find((entry) => entry._id === userId);

    if (!user) {
      return;
    }

    user.lastLoginAt = new Date().toISOString();
    user.updatedAt = user.lastLoginAt;
  }

  // Shop methods
  async listShops() {
    return this.shops.map((shop) => ({
      ...shop,
      analytics: { ...shop.analytics }
    }));
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

    this.shops.push(shop);
    return { ...shop, analytics: { ...shop.analytics } };
  }

  async findShopById(shopId: string) {
    const shop = this.shops.find((entry) => entry.id === shopId);
    return shop ? { ...shop, analytics: { ...shop.analytics } } : undefined;
  }

  async findShopByOwnerId(ownerUserId: string) {
    const shop = this.shops.find((entry) => entry.ownerUserId === ownerUserId);
    return shop ? { ...shop, analytics: { ...shop.analytics } } : undefined;
  }

  async updateShop(shopId: string, input: ShopProfileUpdateInput) {
    const shop = this.shops.find((entry) => entry.id === shopId);

    if (!shop) {
      return undefined;
    }

    if (input.name !== undefined) {
      shop.name = input.name;
    }

    if (input.type !== undefined) {
      shop.type = input.type;
    }

    if (input.ownerName !== undefined) {
      shop.ownerName = input.ownerName;
    }

    if (input.phone !== undefined) {
      shop.phone = input.phone;
    }

    if (input.address !== undefined) {
      shop.address = input.address;
    }

    if (input.latitude !== undefined) {
      shop.latitude = input.latitude;
    }

    if (input.longitude !== undefined) {
      shop.longitude = input.longitude;
    }

    if (input.serviceRadiusKm !== undefined) {
      shop.serviceRadiusKm = input.serviceRadiusKm;
    }

    return { ...shop, analytics: { ...shop.analytics } };
  }

  async incrementShopAnalytics(shopId: string, delta: Partial<Shop["analytics"]>) {
    const shop = this.shops.find((entry) => entry.id === shopId);

    if (!shop) {
      return undefined;
    }

    shop.analytics.views += delta.views ?? 0;
    shop.analytics.clicks += delta.clicks ?? 0;
    shop.analytics.searchHits += delta.searchHits ?? 0;

    return { ...shop, analytics: { ...shop.analytics } };
  }

  // Catalog methods
  async listCatalogProducts() {
    return this.catalogProducts.map((product) => ({
      ...product,
      keywords: [...product.keywords],
      imageHints: [...product.imageHints]
    }));
  }

  async findCatalogProductById(productId: string) {
    const product = this.catalogProducts.find((entry) => entry.id === productId);
    return product
      ? {
          ...product,
          keywords: [...product.keywords],
          imageHints: [...product.imageHints]
        }
      : undefined;
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

    this.catalogProducts.push(product);
    return {
      ...product,
      keywords: [...product.keywords],
      imageHints: [...product.imageHints]
    };
  }

  // Inventory methods
  async listInventoryItems() {
    return this.inventory.map((item) => ({ ...item }));
  }

  async listInventoryByShop(shopId: string) {
    return this.inventory.filter((item) => item.shopId === shopId).map((item) => ({ ...item }));
  }

  async findInventoryItem(shopId: string, productId: string) {
    const item = this.inventory.find(
      (entry) => entry.shopId === shopId && entry.productId === productId
    );

    return item ? { ...item } : undefined;
  }

  async upsertInventoryItem(input: InventoryItemUpsertInput) {
    const existing = this.inventory.find(
      (item) => item.shopId === input.shopId && item.productId === input.productId
    );

    if (existing) {
      existing.stockStatus = input.stockStatus;
      existing.quantity = input.quantity;
      existing.price = input.price;
      existing.mrp = input.mrp;
      existing.imageUrl = input.imageUrl;
      existing.lastUpdatedAt = new Date().toISOString();
      return { ...existing };
    }

    const inventoryItem: InventoryItem = {
      id: `inv-${randomUUID()}`,
      shopId: input.shopId,
      productId: input.productId,
      stockStatus: input.stockStatus,
      quantity: input.quantity,
      price: input.price,
      mrp: input.mrp,
      imageUrl: input.imageUrl,
      lastUpdatedAt: new Date().toISOString()
    };

    this.inventory.push(inventoryItem);
    return { ...inventoryItem };
  }

  async deleteInventoryItem(shopId: string, productId: string) {
    const index = this.inventory.findIndex(
      (item) => item.shopId === shopId && item.productId === productId
    );

    if (index === -1) {
      return false;
    }

    this.inventory.splice(index, 1);
    return true;
  }

  // Tracking methods
  async createOnboardingSession(input: OnboardingSessionCreateInput) {
    const now = new Date().toISOString();
    const sessionId = `onb-${randomUUID()}`;

    this.onboardingSessions.push({
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
    const session = this.onboardingSessions.find((entry) => entry._id === input.sessionId);

    if (!session) {
      return;
    }

    session.status = input.status;
    session.acceptedCatalogProductId = input.acceptedCatalogProductId;
    session.ownerCorrections = input.ownerCorrections;
    session.updatedAt = new Date().toISOString();
  }

  async createSearchLog(input: SearchLogCreateInput) {
    this.searchLogs.push({
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
    this.analyticsEvents.push({
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
    const record: PickupIntentRecord = {
      _id: `pick-${randomUUID()}`,
      shopId: input.shopId,
      catalogProductId: input.productId,
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

    this.pickupIntents.push(record);
    return this.toPickupIntent(record);
  }

  async findPickupIntentById(intentId: string) {
    const record = this.pickupIntents.find((entry) => entry._id === intentId);
    return record ? this.toPickupIntent(record) : undefined;
  }

  async listPickupIntentsByShop(shopId: string) {
    return this.pickupIntents
      .filter((entry) => entry.shopId === shopId)
      .map((entry) => this.toPickupIntent(entry))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async listPickupIntentsByCustomer(input: {
    customerUserId?: string;
    customerPhone?: string;
  }) {
    return this.pickupIntents
      .filter((entry) => {
        const matchesUser = input.customerUserId && entry.customerUserId === input.customerUserId;
        const matchesPhone = input.customerPhone && entry.customerPhone === input.customerPhone;
        return Boolean(matchesUser || matchesPhone);
      })
      .map((entry) => this.toPickupIntent(entry))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  async updatePickupIntentStatus(intentId: string, status: PickupIntent["status"]) {
    const record = this.pickupIntents.find((entry) => entry._id === intentId);

    if (!record) {
      return undefined;
    }

    record.status = status;
    record.updatedAt = new Date().toISOString();
    return this.toPickupIntent(record);
  }

  // Small mappers keep returned data detached from in-memory state.
  private toUser(record: UserRecord): User {
    return {
      id: record._id,
      role: record.role,
      fullName: record.fullName,
      email: record.email,
      phone: record.phone,
      isVerified: record.isVerified,
      status: record.status,
      lastLoginAt: record.lastLoginAt,
      createdAt: record.createdAt
    };
  }

  private toPickupIntent(record: PickupIntentRecord): PickupIntent {
    return {
      id: record._id,
      shopId: record.shopId,
      productId: record.catalogProductId,
      inventoryItemId: record.inventoryItemId,
      customerUserId: record.customerUserId,
      customerName: record.customerName,
      customerPhone: record.customerPhone,
      quantityRequested: record.quantityRequested,
      note: record.note,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  }
}
