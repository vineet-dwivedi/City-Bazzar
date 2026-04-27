import { Router } from "express";
import { AuthenticatedRequest, requireAuth, requireShopOwner } from "../middleware/auth.middleware.js";
import { ownerService } from "../services/owner.service.js";
import { asyncHandler } from "../utils/async-handler.js";

export const ownerRouter = Router();
const allowedShopTypes = new Set(["kirana", "stationery", "pharmacy", "general-store"]);
const allowedStockStatuses = new Set(["in_stock", "low_stock", "out_of_stock"]);

ownerRouter.use(requireAuth, requireShopOwner);

ownerRouter.post("/shop", asyncHandler(async (request, response) => {
  const authUser = (request as AuthenticatedRequest).authUser!;
  const requiredFields = ["name", "type", "phone", "address", "latitude", "longitude"];
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

  const shop = await ownerService.createOwnerShop(authUser.id, {
    name: String(request.body.name),
    type: request.body.type,
    ownerName: request.body.ownerName !== undefined ? String(request.body.ownerName) : authUser.fullName,
    phone: String(request.body.phone),
    address: String(request.body.address),
    latitude,
    longitude,
    serviceRadiusKm
  });

  if (!shop) {
    response.status(409).json({ message: "This owner already has a shop profile." });
    return;
  }

  response.status(201).json(shop);
}));

ownerRouter.get("/shop", asyncHandler(async (request, response) => {
  const authUser = (request as AuthenticatedRequest).authUser!;
  const shop = await ownerService.getOwnerShop(authUser.id);

  if (!shop) {
    response.status(404).json({ message: "No shop is linked to this owner yet." });
    return;
  }

  response.json(shop);
}));

ownerRouter.patch("/shop", asyncHandler(async (request, response) => {
  const authUser = (request as AuthenticatedRequest).authUser!;
  const type = request.body.type;
  const latitude = request.body.latitude !== undefined ? Number(request.body.latitude) : undefined;
  const longitude = request.body.longitude !== undefined ? Number(request.body.longitude) : undefined;
  const serviceRadiusKm =
    request.body.serviceRadiusKm !== undefined ? Number(request.body.serviceRadiusKm) : undefined;

  if (type !== undefined && !allowedShopTypes.has(String(type))) {
    response.status(400).json({ message: "type must be kirana, stationery, pharmacy, or general-store." });
    return;
  }

  if (
    (latitude !== undefined && Number.isNaN(latitude)) ||
    (longitude !== undefined && Number.isNaN(longitude)) ||
    (serviceRadiusKm !== undefined && Number.isNaN(serviceRadiusKm))
  ) {
    response.status(400).json({ message: "latitude, longitude, and serviceRadiusKm must be valid numbers." });
    return;
  }

  const updated = await ownerService.updateOwnerShop(authUser.id, {
    name: request.body.name !== undefined ? String(request.body.name) : undefined,
    type,
    ownerName: request.body.ownerName !== undefined ? String(request.body.ownerName) : undefined,
    phone: request.body.phone !== undefined ? String(request.body.phone) : undefined,
    address: request.body.address !== undefined ? String(request.body.address) : undefined,
    latitude,
    longitude,
    serviceRadiusKm
  });

  if (!updated) {
    response.status(404).json({ message: "No shop is linked to this owner yet." });
    return;
  }

  response.json(updated);
}));

ownerRouter.get("/inventory", asyncHandler(async (request, response) => {
  const authUser = (request as AuthenticatedRequest).authUser!;
  const inventory = await ownerService.getOwnerInventory(authUser.id);

  if (!inventory) {
    response.status(404).json({ message: "No shop is linked to this owner yet." });
    return;
  }

  response.json({ inventory });
}));

ownerRouter.post("/inventory", asyncHandler(async (request, response) => {
  const authUser = (request as AuthenticatedRequest).authUser!;
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

  const inventoryItem = await ownerService.upsertOwnerInventoryItem(authUser.id, {
    productId,
    stockStatus,
    quantity,
    price,
    mrp,
    imageUrl: typeof request.body.imageUrl === "string" ? request.body.imageUrl : undefined
  });

  if (!inventoryItem) {
    response.status(404).json({ message: "Owner shop or product not found." });
    return;
  }

  response.status(201).json(inventoryItem);
}));

ownerRouter.patch("/inventory/:productId", asyncHandler(async (request, response) => {
  const authUser = (request as AuthenticatedRequest).authUser!;
  const quantity = Number(request.body.quantity ?? 1);
  const price = Number(request.body.price ?? 0);
  const mrp = Number(request.body.mrp ?? request.body.price ?? 0);
  const stockStatus = request.body.stockStatus ?? "in_stock";

  if (!allowedStockStatuses.has(String(stockStatus))) {
    response.status(400).json({ message: "stockStatus must be in_stock, low_stock, or out_of_stock." });
    return;
  }

  if (Number.isNaN(quantity) || Number.isNaN(price) || Number.isNaN(mrp)) {
    response.status(400).json({ message: "quantity, price, and mrp must be valid numbers." });
    return;
  }

  const inventoryItem = await ownerService.upsertOwnerInventoryItem(authUser.id, {
    productId: request.params.productId,
    stockStatus,
    quantity,
    price,
    mrp,
    imageUrl: typeof request.body.imageUrl === "string" ? request.body.imageUrl : undefined
  });

  if (!inventoryItem) {
    response.status(404).json({ message: "Owner shop or product not found." });
    return;
  }

  response.json(inventoryItem);
}));

ownerRouter.delete("/inventory/:productId", asyncHandler(async (request, response) => {
  const authUser = (request as AuthenticatedRequest).authUser!;
  const deleted = await ownerService.deleteOwnerInventoryItem(authUser.id, request.params.productId);

  if (!deleted) {
    response.status(404).json({ message: "Owner inventory item not found." });
    return;
  }

  response.status(204).send();
}));
