export type ShopType = "kirana" | "stationery" | "pharmacy" | "general-store";
export type UserRole = "shop_owner" | "customer" | "admin";
export type UserStatus = "active" | "pending_verification" | "disabled";

export type ProductCategory =
  | "grocery"
  | "stationery"
  | "pharmacy"
  | "personal-care"
  | "beverages"
  | "snacks"
  | "household";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";
export type AnalyticsEventType = "view" | "click";

export interface ShopAnalytics {
  views: number;
  clicks: number;
  searchHits: number;
}

export interface Shop {
  id: string;
  ownerUserId?: string;
  name: string;
  type: ShopType;
  ownerName: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  serviceRadiusKm: number;
  analytics: ShopAnalytics;
  createdAt: string;
}

export interface User {
  id: string;
  role: UserRole;
  fullName: string;
  email?: string;
  phone?: string;
  isVerified: boolean;
  status: UserStatus;
  lastLoginAt?: string;
  createdAt: string;
}

export interface CatalogProduct {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  unit: string;
  defaultMrp: number;
  keywords: string[];
  imageHints: string[];
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  shopId: string;
  productId: string;
  stockStatus: StockStatus;
  quantity: number;
  price: number;
  mrp: number;
  imageUrl?: string;
  lastUpdatedAt: string;
}

export interface OnboardingAnalysis {
  sessionId?: string;
  source: {
    imageUrl: string;
    combinedText: string;
  };
  extracted: {
    name: string;
    brand: string;
    category: ProductCategory;
    mrp: number | null;
    price: number | null;
  };
  catalogMatch: {
    status: "existing" | "new";
    confidence: number;
    product?: CatalogProduct;
  };
  suggestedKeywords: string[];
  notes: string[];
}

export interface CatalogSearchMatch {
  product: CatalogProduct;
  score: number;
}

export interface NearbyShopResult {
  shopId: string;
  shopName: string;
  address: string;
  type: ShopType;
  distanceKm: number;
  stockStatus: StockStatus;
  price: number;
  mrp: number;
  quantity: number;
}

export interface ProductDiscoveryResult {
  product: CatalogProduct;
  nearbyShops: NearbyShopResult[];
}
