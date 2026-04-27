// Mappers translate between app-facing models and Mongo-shaped records.
import { CatalogProduct, InventoryItem, PickupIntent, Shop, User } from "../types.js";
import {
  AddressRecord,
  AiOnboardingSessionRecord,
  AnalyticsEventRecord,
  CatalogAlias,
  CatalogProductRecord,
  InventoryItemRecord,
  PickupIntentRecord,
  SearchLogRecord,
  ShopRecord,
  UserRecord
} from "../persistence.types.js";
import { tokenize, uniqueStrings, normalizeText } from "../utils/text.js";
import { slugify } from "../utils/slug.js";

const defaultAddress = (formattedAddress: string): AddressRecord => ({
  line1: formattedAddress,
  city: "Unknown",
  country: "India",
  formattedAddress
});

export const toShopRecord = (shop: Shop): ShopRecord => ({
  _id: shop.id,
  ownerUserId: shop.ownerUserId ?? `bootstrap-owner:${shop.id}`,
  contactName: shop.ownerName,
  name: shop.name,
  slug: slugify(shop.name || shop.id),
  type: shop.type,
  phone: shop.phone,
  address: defaultAddress(shop.address),
  location: {
    type: "Point",
    coordinates: [shop.longitude, shop.latitude]
  },
  serviceRadiusKm: shop.serviceRadiusKm,
  status: "active",
  verificationStatus: "unverified",
  businessHours: [],
  metricsSummary: {
    views: shop.analytics.views,
    clicks: shop.analytics.clicks,
    searchHits: shop.analytics.searchHits,
    inventoryCount: 0
  },
  createdAt: shop.createdAt,
  updatedAt: shop.createdAt
});

export const toShop = (record: ShopRecord): Shop => ({
  id: record._id,
  ownerUserId: record.ownerUserId,
  name: record.name,
  type: record.type,
  ownerName: record.contactName ?? "Unassigned Owner",
  phone: record.phone,
  address: record.address.formattedAddress,
  latitude: record.location.coordinates[1],
  longitude: record.location.coordinates[0],
  serviceRadiusKm: record.serviceRadiusKm,
  analytics: {
    views: record.metricsSummary.views,
    clicks: record.metricsSummary.clicks,
    searchHits: record.metricsSummary.searchHits
  },
  createdAt: record.createdAt
});

export const toUser = (record: UserRecord): User => ({
  id: record._id,
  role: record.role,
  fullName: record.fullName,
  email: record.email,
  phone: record.phone,
  isVerified: record.isVerified,
  status: record.status,
  lastLoginAt: record.lastLoginAt,
  createdAt: record.createdAt
});

export const toUserRecord = (record: UserRecord) => record;

export const buildCatalogAliases = (product: CatalogProduct): CatalogAlias[] =>
  uniqueStrings([product.name, `${product.brand} ${product.name}`]).map((value) => ({
    value,
    normalizedValue: normalizeText(value)
  }));

export const buildCatalogSearchTokens = (product: CatalogProduct) =>
  uniqueStrings(tokenize(`${product.name} ${product.brand} ${product.keywords.join(" ")}`));

export const toCatalogProductRecord = (product: CatalogProduct): CatalogProductRecord => ({
  _id: product.id,
  canonicalName: product.name,
  normalizedName: normalizeText(product.name),
  brand: product.brand,
  category: product.category,
  unit: product.unit,
  defaultMrp: product.defaultMrp,
  keywords: [...product.keywords],
  searchTokens: buildCatalogSearchTokens(product),
  imageHints: [...product.imageHints],
  aliases: buildCatalogAliases(product),
  createdAt: product.createdAt,
  updatedAt: product.createdAt
});

export const toCatalogProduct = (record: CatalogProductRecord): CatalogProduct => ({
  id: record._id,
  name: record.canonicalName,
  brand: record.brand,
  category: record.category,
  unit: record.unit,
  defaultMrp: record.defaultMrp,
  keywords: [...record.keywords],
  imageHints: [...record.imageHints],
  createdAt: record.createdAt
});

export const toInventoryItemRecord = (
  item: InventoryItem,
  displayName: string
): InventoryItemRecord => ({
  _id: item.id,
  shopId: item.shopId,
  catalogProductId: item.productId,
  displayName,
  price: item.price,
  mrp: item.mrp,
  quantity: item.quantity,
  stockStatus: item.stockStatus,
  imageUrls: item.imageUrl ? [item.imageUrl] : [],
  source: "manual",
  lastConfirmedAt: item.lastUpdatedAt,
  createdAt: item.lastUpdatedAt,
  updatedAt: item.lastUpdatedAt
});

export const toInventoryItem = (record: InventoryItemRecord): InventoryItem => ({
  id: record._id,
  shopId: record.shopId,
  productId: record.catalogProductId,
  stockStatus: record.stockStatus,
  quantity: record.quantity,
  price: record.price,
  mrp: record.mrp,
  imageUrl: record.imageUrls[0],
  lastUpdatedAt: record.updatedAt
});

export const toPickupIntentRecord = (intent: PickupIntent): PickupIntentRecord => ({
  _id: intent.id,
  shopId: intent.shopId,
  catalogProductId: intent.productId,
  inventoryItemId: intent.inventoryItemId,
  customerUserId: intent.customerUserId,
  customerName: intent.customerName,
  customerPhone: intent.customerPhone,
  quantityRequested: intent.quantityRequested,
  note: intent.note,
  status: intent.status,
  createdAt: intent.createdAt,
  updatedAt: intent.updatedAt
});

export const toPickupIntent = (record: PickupIntentRecord): PickupIntent => ({
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
});

export const createSearchLogRecord = (
  record: SearchLogRecord
) => record;

export const createAnalyticsEventRecord = (
  record: AnalyticsEventRecord
) => record;

export const createOnboardingSessionRecord = (
  record: AiOnboardingSessionRecord
) => record;
