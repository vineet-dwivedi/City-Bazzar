// Shared app constants live here so routes and services stay in sync.
import { PickupIntentStatus, ProductCategory, ShopType, StockStatus } from "./types.js";

export const APP_NAME = "urbnbzr";
export const APP_LABEL = "UrbnBzr";
export const DEFAULT_DB_NAME = "urbnbzr";

export const SHOP_TYPES = ["kirana", "stationery", "pharmacy", "general-store"] as const satisfies readonly ShopType[];
export const PRODUCT_CATEGORIES = [
  "grocery",
  "stationery",
  "pharmacy",
  "personal-care",
  "beverages",
  "snacks",
  "household"
 ] as const satisfies readonly ProductCategory[];
export const STOCK_STATUSES = ["in_stock", "low_stock", "out_of_stock"] as const satisfies readonly StockStatus[];
export const PICKUP_INTENT_STATUSES = [
  "requested",
  "acknowledged",
  "ready_for_pickup",
  "completed",
  "cancelled"
] as const satisfies readonly PickupIntentStatus[];

export const isOneOf = <T extends readonly string[]>(value: string, allowed: T): value is T[number] =>
  allowed.includes(value);
