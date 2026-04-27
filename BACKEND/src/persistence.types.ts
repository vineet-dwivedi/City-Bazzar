// Mongo-shaped records live here so runtime models stay simple elsewhere.
import { AnalyticsEventType, OnboardingAnalysis, ProductCategory, ShopType, StockStatus, UserRole, UserStatus } from "./types.js";

export const COLLECTIONS = {
  users: "users",
  shops: "shops",
  catalogProducts: "catalog_products",
  inventoryItems: "inventory_items",
  aiOnboardingSessions: "ai_onboarding_sessions",
  searchLogs: "search_logs",
  analyticsEvents: "analytics_events",
  pickupIntents: "pickup_intents"
} as const;

export type ShopStatus = "draft" | "active" | "suspended";
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";
export type InventorySource = "manual" | "ai_assisted";
export type AiOnboardingStatus = "analyzed" | "confirmed" | "rejected";
export type PickupIntentStatus =
  | "requested"
  | "acknowledged"
  | "ready_for_pickup"
  | "completed"
  | "cancelled";
export type AnalyticsEventName =
  | AnalyticsEventType
  | "search"
  | "shop_open"
  | "inventory_added"
  | "pickup_intent";

export interface MongoRecord {
  _id: string;
}

export interface TimestampFields {
  createdAt: string;
  updatedAt: string;
}

export interface GeoPoint {
  type: "Point";
  coordinates: [number, number];
}

export interface AddressRecord {
  line1: string;
  line2?: string;
  area?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  formattedAddress: string;
}

export interface ShopMetricsSummary {
  views: number;
  clicks: number;
  searchHits: number;
  inventoryCount: number;
  lastInventoryUpdateAt?: string;
}

export interface BusinessHourSlot {
  dayOfWeek: number;
  opensAt: string;
  closesAt: string;
  isClosed: boolean;
}

export interface UserRecord extends MongoRecord, TimestampFields {
  role: UserRole;
  fullName: string;
  email?: string;
  phone?: string;
  passwordHash: string;
  isVerified: boolean;
  status: UserStatus;
  lastLoginAt?: string;
}

export interface ShopRecord extends MongoRecord, TimestampFields {
  ownerUserId: string;
  contactName?: string;
  name: string;
  slug: string;
  type: ShopType;
  phone: string;
  address: AddressRecord;
  location: GeoPoint;
  serviceRadiusKm: number;
  status: ShopStatus;
  verificationStatus: VerificationStatus;
  businessHours: BusinessHourSlot[];
  metricsSummary: ShopMetricsSummary;
}

export interface CatalogAlias {
  value: string;
  normalizedValue: string;
}

export interface CatalogProductRecord extends MongoRecord, TimestampFields {
  canonicalName: string;
  normalizedName: string;
  brand: string;
  category: ProductCategory;
  unit: string;
  defaultMrp: number;
  keywords: string[];
  searchTokens: string[];
  imageHints: string[];
  aliases: CatalogAlias[];
  createdByUserId?: string;
}

export interface InventoryItemRecord extends MongoRecord, TimestampFields {
  shopId: string;
  catalogProductId: string;
  displayName: string;
  price: number;
  mrp: number;
  quantity: number;
  stockStatus: StockStatus;
  imageUrls: string[];
  source: InventorySource;
  lastConfirmedAt?: string;
  updatedByUserId?: string;
}

export interface OwnerCorrections {
  name?: string;
  brand?: string;
  category?: ProductCategory;
  mrp?: number | null;
  price?: number | null;
}

export interface ModelMeta {
  provider: string;
  model: string;
  confidence: number;
}

export interface AiOnboardingSessionRecord extends MongoRecord, TimestampFields {
  shopId: string;
  createdByUserId: string;
  sourceImageUrl: string;
  rawOcrText?: string;
  manualHint?: string;
  analysis: OnboardingAnalysis;
  status: AiOnboardingStatus;
  acceptedCatalogProductId?: string;
  ownerCorrections?: OwnerCorrections;
  modelMeta?: ModelMeta;
}

export interface SearchLocation {
  lat: number;
  lng: number;
}

export interface SearchLogRecord extends MongoRecord {
  actorUserId?: string;
  query: string;
  normalizedQuery: string;
  location?: SearchLocation;
  radiusKm: number;
  resultCount: number;
  selectedShopId?: string;
  selectedCatalogProductId?: string;
  searchAt: string;
}

export interface AnalyticsEventRecord extends MongoRecord {
  eventType: AnalyticsEventName;
  actorUserId?: string;
  shopId?: string;
  catalogProductId?: string;
  inventoryItemId?: string;
  sessionId?: string;
  metadata?: Record<string, string | number | boolean | null>;
  createdAt: string;
}

export interface PickupIntentRecord extends MongoRecord, TimestampFields {
  shopId: string;
  catalogProductId: string;
  inventoryItemId?: string;
  customerUserId?: string;
  customerName: string;
  customerPhone: string;
  quantityRequested: number;
  note?: string;
  status: PickupIntentStatus;
}
