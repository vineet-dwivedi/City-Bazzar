// Demo data used by memory mode and first-time Mongo seeding.
import { CatalogProduct, InventoryItem, Shop } from "../types.js";

const now = new Date().toISOString();

const shops: Shop[] = [
  {
    id: "shop-gupta-kirana",
    name: "Gupta Kirana Store",
    type: "kirana",
    ownerName: "Rakesh Gupta",
    phone: "+91-9876543210",
    address: "Connaught Place, New Delhi",
    latitude: 28.6315,
    longitude: 77.2167,
    serviceRadiusKm: 4,
    analytics: { views: 120, clicks: 48, searchHits: 64 },
    createdAt: now
  },
  {
    id: "shop-smart-stationers",
    name: "Smart Stationers",
    type: "stationery",
    ownerName: "Pooja Arora",
    phone: "+91-9811112345",
    address: "Karol Bagh, New Delhi",
    latitude: 28.6519,
    longitude: 77.1909,
    serviceRadiusKm: 5,
    analytics: { views: 87, clicks: 34, searchHits: 22 },
    createdAt: now
  },
  {
    id: "shop-healthcare-pharmacy",
    name: "HealthCare Pharmacy",
    type: "pharmacy",
    ownerName: "Nitin Sethi",
    phone: "+91-9898989898",
    address: "Patel Nagar, New Delhi",
    latitude: 28.6451,
    longitude: 77.164,
    serviceRadiusKm: 6,
    analytics: { views: 142, clicks: 71, searchHits: 55 },
    createdAt: now
  },
  {
    id: "shop-fresh-basket",
    name: "Fresh Basket Mini Mart",
    type: "general-store",
    ownerName: "Shivani Malhotra",
    phone: "+91-9822222222",
    address: "Rajouri Garden, New Delhi",
    latitude: 28.645,
    longitude: 77.1188,
    serviceRadiusKm: 5,
    analytics: { views: 60, clicks: 19, searchHits: 18 },
    createdAt: now
  }
];

const catalogProducts: CatalogProduct[] = [
  {
    id: "prod-colgate-strong-teeth",
    name: "Colgate Strong Teeth Toothpaste",
    brand: "Colgate",
    category: "personal-care",
    unit: "200 g",
    defaultMrp: 95,
    keywords: ["toothpaste", "oral care", "colgate", "strong teeth"],
    imageHints: ["colgate", "red toothpaste box"],
    createdAt: now
  },
  {
    id: "prod-dove-shampoo-340",
    name: "Dove Intense Repair Shampoo",
    brand: "Dove",
    category: "personal-care",
    unit: "340 ml",
    defaultMrp: 265,
    keywords: ["shampoo", "hair care", "dove"],
    imageHints: ["dove bottle", "white shampoo"],
    createdAt: now
  },
  {
    id: "prod-maggi-noodles",
    name: "Maggi 2-Minute Noodles",
    brand: "Maggi",
    category: "grocery",
    unit: "280 g",
    defaultMrp: 70,
    keywords: ["maggi", "noodles", "instant food"],
    imageHints: ["yellow packet", "maggi noodles"],
    createdAt: now
  },
  {
    id: "prod-parle-g",
    name: "Parle-G Biscuits",
    brand: "Parle",
    category: "snacks",
    unit: "800 g",
    defaultMrp: 120,
    keywords: ["parle g", "biscuits", "snack"],
    imageHints: ["biscuit packet", "parle"],
    createdAt: now
  },
  {
    id: "prod-classmate-notebook",
    name: "Classmate Notebook",
    brand: "Classmate",
    category: "stationery",
    unit: "200 pages",
    defaultMrp: 110,
    keywords: ["notebook", "classmate", "copy", "school"],
    imageHints: ["spiral notebook", "classmate cover"],
    createdAt: now
  },
  {
    id: "prod-dettol-sanitizer",
    name: "Dettol Hand Sanitizer",
    brand: "Dettol",
    category: "personal-care",
    unit: "50 ml",
    defaultMrp: 35,
    keywords: ["sanitizer", "dettol", "hand wash"],
    imageHints: ["green dettol bottle", "sanitizer"],
    createdAt: now
  },
  {
    id: "prod-crocin-advance",
    name: "Crocin Advance 500mg",
    brand: "Crocin",
    category: "pharmacy",
    unit: "15 tablets",
    defaultMrp: 25,
    keywords: ["crocin", "paracetamol", "fever", "tablet"],
    imageHints: ["medicine strip", "crocin box"],
    createdAt: now
  },
  {
    id: "prod-amul-taaza",
    name: "Amul Taaza Milk",
    brand: "Amul",
    category: "beverages",
    unit: "1 L",
    defaultMrp: 72,
    keywords: ["milk", "amul", "dairy"],
    imageHints: ["milk packet", "amul taaza"],
    createdAt: now
  }
];

const inventory: InventoryItem[] = [
  {
    id: "inv-1",
    shopId: "shop-gupta-kirana",
    productId: "prod-colgate-strong-teeth",
    stockStatus: "in_stock",
    quantity: 18,
    price: 90,
    mrp: 95,
    imageUrl: "https://example.com/images/colgate.jpg",
    lastUpdatedAt: now
  },
  {
    id: "inv-2",
    shopId: "shop-gupta-kirana",
    productId: "prod-maggi-noodles",
    stockStatus: "in_stock",
    quantity: 40,
    price: 68,
    mrp: 70,
    imageUrl: "https://example.com/images/maggi.jpg",
    lastUpdatedAt: now
  },
  {
    id: "inv-3",
    shopId: "shop-gupta-kirana",
    productId: "prod-amul-taaza",
    stockStatus: "low_stock",
    quantity: 6,
    price: 72,
    mrp: 72,
    imageUrl: "https://example.com/images/amul-taaza.jpg",
    lastUpdatedAt: now
  },
  {
    id: "inv-4",
    shopId: "shop-smart-stationers",
    productId: "prod-classmate-notebook",
    stockStatus: "in_stock",
    quantity: 54,
    price: 105,
    mrp: 110,
    imageUrl: "https://example.com/images/classmate.jpg",
    lastUpdatedAt: now
  },
  {
    id: "inv-5",
    shopId: "shop-healthcare-pharmacy",
    productId: "prod-crocin-advance",
    stockStatus: "in_stock",
    quantity: 25,
    price: 24,
    mrp: 25,
    imageUrl: "https://example.com/images/crocin.jpg",
    lastUpdatedAt: now
  },
  {
    id: "inv-6",
    shopId: "shop-healthcare-pharmacy",
    productId: "prod-dettol-sanitizer",
    stockStatus: "in_stock",
    quantity: 20,
    price: 34,
    mrp: 35,
    imageUrl: "https://example.com/images/dettol.jpg",
    lastUpdatedAt: now
  },
  {
    id: "inv-7",
    shopId: "shop-fresh-basket",
    productId: "prod-dove-shampoo-340",
    stockStatus: "in_stock",
    quantity: 12,
    price: 259,
    mrp: 265,
    imageUrl: "https://example.com/images/dove.jpg",
    lastUpdatedAt: now
  },
  {
    id: "inv-8",
    shopId: "shop-fresh-basket",
    productId: "prod-parle-g",
    stockStatus: "low_stock",
    quantity: 8,
    price: 115,
    mrp: 120,
    imageUrl: "https://example.com/images/parle-g.jpg",
    lastUpdatedAt: now
  }
];

export const createSeedState = () => ({
  shops: shops.map((shop) => ({
    ...shop,
    analytics: { ...shop.analytics }
  })),
  catalogProducts: catalogProducts.map((product) => ({
    ...product,
    keywords: [...product.keywords],
    imageHints: [...product.imageHints]
  })),
  inventory: inventory.map((item) => ({ ...item }))
});
