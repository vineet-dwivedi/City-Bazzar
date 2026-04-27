import { Router } from "express";
import { discoveryService } from "../services/discovery.service.js";
import { shopService } from "../services/shop.service.js";
import { asyncHandler } from "../utils/async-handler.js";

export const shopRouter = Router();

const allowedShopTypes = new Set(["kirana", "stationery", "pharmacy", "general-store"]);
const allowedStockStatuses = new Set(["in_stock", "low_stock", "out_of_stock"]);

shopRouter.get("/", asyncHandler(async (request, response) => {
  const lat = request.query.lat !== undefined ? Number(request.query.lat) : undefined;
  const lng = request.query.lng !== undefined ? Number(request.query.lng) : undefined;
  const radiusKm = request.query.radiusKm !== undefined ? Number(request.query.radiusKm) : undefined;
  const query = request.query.query !== undefined ? String(request.query.query) : undefined;

  if ((lat !== undefined && Number.isNaN(lat)) || (lng !== undefined && Number.isNaN(lng))) {
    response.status(400).json({ message: "lat and lng must be valid numbers when provided." });
    return;
  }

  if (radiusKm !== undefined && Number.isNaN(radiusKm)) {
    response.status(400).json({ message: "radiusKm must be a valid number when provided." });
    return;
  }

  response.json({
    shops: await discoveryService.listShops({ lat, lng, radiusKm, query })
  });
}));

shopRouter.post("/register", asyncHandler(async (request, response) => {
  const requiredFields = ["name", "type", "ownerName", "phone", "address", "latitude", "longitude"];
  const missing = requiredFields.filter((field) => request.body[field] === undefined || request.body[field] === "");

  if (missing.length > 0) {
    response.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
    return;
  }

  if (!allowedShopTypes.has(String(request.body.type))) {
    response.status(400).json({ message: "type must be kirana, stationery, pharmacy, or general-store." });
    return;
  }

  const latitude = Number(request.body.latitude);
  const longitude = Number(request.body.longitude);
  const serviceRadiusKm =
    request.body.serviceRadiusKm !== undefined ? Number(request.body.serviceRadiusKm) : undefined;

  if (
    Number.isNaN(latitude) ||
    Number.isNaN(longitude) ||
    (serviceRadiusKm !== undefined && Number.isNaN(serviceRadiusKm))
  ) {
    response.status(400).json({ message: "latitude, longitude, and serviceRadiusKm must be valid numbers." });
    return;
  }

  const shop = await shopService.registerShop({
    name: String(request.body.name),
    type: request.body.type,
    ownerName: String(request.body.ownerName),
    phone: String(request.body.phone),
    address: String(request.body.address),
    latitude,
    longitude,
    serviceRadiusKm
  });

  response.status(201).json(shop);
}));

shopRouter.get("/:shopId", asyncHandler(async (request, response) => {
  const shop = await shopService.getShop(request.params.shopId);

  if (!shop) {
    response.status(404).json({ message: "Shop not found." });
    return;
  }

  response.json(shop);
}));

shopRouter.get("/:shopId/analytics", asyncHandler(async (request, response) => {
  const analytics = await shopService.getAnalytics(request.params.shopId);

  if (!analytics) {
    response.status(404).json({ message: "Shop not found." });
    return;
  }

  response.json(analytics);
}));

shopRouter.post("/:shopId/events", asyncHandler(async (request, response) => {
  const type = request.body.type;

  if (type !== "view" && type !== "click") {
    response.status(400).json({ message: "Event type must be view or click." });
    return;
  }

  const analytics = await shopService.recordEvent(request.params.shopId, type);

  if (!analytics) {
    response.status(404).json({ message: "Shop not found." });
    return;
  }

  response.status(201).json(analytics);
}));

shopRouter.post("/:shopId/inventory", asyncHandler(async (request, response) => {
  const productId = String(request.body.productId ?? "").trim();
  const quantity = Number(request.body.quantity ?? 1);
  const price = Number(request.body.price ?? 0);
  const mrp = Number(request.body.mrp ?? request.body.price ?? 0);
  const stockStatus = request.body.stockStatus ?? "in_stock";

  if (!productId) {
    response.status(400).json({ message: "productId is required." });
    return;
  }

  if (!allowedStockStatuses.has(String(stockStatus))) {
    response.status(400).json({ message: "stockStatus must be in_stock, low_stock, or out_of_stock." });
    return;
  }

  if (Number.isNaN(quantity) || Number.isNaN(price) || Number.isNaN(mrp)) {
    response.status(400).json({ message: "quantity, price, and mrp must be valid numbers." });
    return;
  }

  const inventory = await shopService.upsertInventoryItem(request.params.shopId, {
    productId,
    stockStatus,
    quantity,
    price,
    mrp,
    imageUrl: typeof request.body.imageUrl === "string" ? request.body.imageUrl : undefined
  });

  if (!inventory) {
    response.status(404).json({ message: "Shop or product not found." });
    return;
  }

  response.status(201).json(inventory);
}));
