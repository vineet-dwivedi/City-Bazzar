// Shared store contracts keep memory and Mongo implementations interchangeable.
import {
  AnalyticsEventType,
  CatalogProduct,
  InventoryItem,
  OnboardingAnalysis,
  PickupIntent,
  PickupIntentStatus,
  ProductCategory,
  Shop,
  ShopAnalytics,
  ShopType,
  StockStatus,
  User,
  UserRole
} from "../types.js";

export type DataStoreMode = "memory" | "mongo";
export type InventorySource = "manual" | "ai_assisted";
export type AnalyticsEventName =
  | AnalyticsEventType
  | "search"
  | "shop_open"
  | "inventory_added"
  | "pickup_intent";

export interface ShopRegistrationInput {
  ownerUserId?: string;
  name: string;
  type: ShopType;
  ownerName: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  serviceRadiusKm?: number;
}

export interface ShopProfileUpdateInput {
  name?: string;
  type?: ShopType;
  ownerName?: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  serviceRadiusKm?: number;
}

export interface UserCreateInput {
  role: UserRole;
  fullName: string;
  email?: string;
  phone?: string;
  passwordHash: string;
}

export interface CatalogProductCreateInput {
  name: string;
  brand: string;
  category: ProductCategory;
  unit?: string;
  mrp?: number | null;
  keywords?: string[];
  imageHints?: string[];
}

export interface InventoryItemUpsertInput {
  shopId: string;
  productId: string;
  stockStatus: StockStatus;
  quantity: number;
  price: number;
  mrp: number;
  imageUrl?: string;
  source?: InventorySource;
}

export interface OnboardingSessionCreateInput {
  shopId?: string;
  sourceImageUrl: string;
  rawOcrText?: string;
  manualHint?: string;
  analysis: OnboardingAnalysis;
  createdByUserId?: string;
}

export interface OnboardingSessionUpdateInput {
  sessionId: string;
  status: "analyzed" | "confirmed" | "rejected";
  acceptedCatalogProductId?: string;
  ownerCorrections?: {
    name?: string;
    brand?: string;
    category?: ProductCategory;
    mrp?: number | null;
    price?: number | null;
  };
}

export interface SearchLogCreateInput {
  actorUserId?: string;
  query: string;
  normalizedQuery: string;
  lat?: number;
  lng?: number;
  radiusKm: number;
  resultCount: number;
  selectedShopId?: string;
  selectedCatalogProductId?: string;
}

export interface PickupIntentCreateInput {
  shopId: string;
  productId: string;
  inventoryItemId?: string;
  customerUserId?: string;
  customerName: string;
  customerPhone: string;
  quantityRequested: number;
  note?: string;
}

export interface AnalyticsEventCreateInput {
  eventType: AnalyticsEventName;
  actorUserId?: string;
  shopId?: string;
  catalogProductId?: string;
  inventoryItemId?: string;
  sessionId?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface SeedState {
  shops: Shop[];
  catalogProducts: CatalogProduct[];
  inventory: InventoryItem[];
}

export interface DataStore {
  readonly mode: DataStoreMode;
  initialize(): Promise<void>;
  createUser(input: UserCreateInput): Promise<User>;
  findUserById(userId: string): Promise<User | undefined>;
  findUserByEmail(email: string): Promise<User | undefined>;
  findUserByPhone(phone: string): Promise<User | undefined>;
  getPasswordHash(userId: string): Promise<string | undefined>;
  touchUserLogin(userId: string): Promise<void>;
  listShops(): Promise<Shop[]>;
  createShop(input: ShopRegistrationInput): Promise<Shop>;
  findShopById(shopId: string): Promise<Shop | undefined>;
  findShopByOwnerId(ownerUserId: string): Promise<Shop | undefined>;
  updateShop(shopId: string, input: ShopProfileUpdateInput): Promise<Shop | undefined>;
  incrementShopAnalytics(shopId: string, delta: Partial<ShopAnalytics>): Promise<Shop | undefined>;
  listCatalogProducts(): Promise<CatalogProduct[]>;
  findCatalogProductById(productId: string): Promise<CatalogProduct | undefined>;
  createCatalogProduct(input: CatalogProductCreateInput): Promise<CatalogProduct>;
  listInventoryItems(): Promise<InventoryItem[]>;
  listInventoryByShop(shopId: string): Promise<InventoryItem[]>;
  findInventoryItem(shopId: string, productId: string): Promise<InventoryItem | undefined>;
  upsertInventoryItem(input: InventoryItemUpsertInput): Promise<InventoryItem>;
  deleteInventoryItem(shopId: string, productId: string): Promise<boolean>;
  createOnboardingSession(input: OnboardingSessionCreateInput): Promise<string>;
  updateOnboardingSession(input: OnboardingSessionUpdateInput): Promise<void>;
  createSearchLog(input: SearchLogCreateInput): Promise<void>;
  createAnalyticsEvent(input: AnalyticsEventCreateInput): Promise<void>;
  createPickupIntent(input: PickupIntentCreateInput): Promise<PickupIntent>;
  findPickupIntentById(intentId: string): Promise<PickupIntent | undefined>;
  listPickupIntentsByShop(shopId: string): Promise<PickupIntent[]>;
  listPickupIntentsByCustomer(input: {
    customerUserId?: string;
    customerPhone?: string;
  }): Promise<PickupIntent[]>;
  updatePickupIntentStatus(
    intentId: string,
    status: PickupIntentStatus
  ): Promise<PickupIntent | undefined>;
}
