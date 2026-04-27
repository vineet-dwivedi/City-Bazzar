// Owner routes keep all write operations behind owner auth.
import { Router } from "express";
import { PICKUP_INTENT_STATUSES, SHOP_TYPES, STOCK_STATUSES, isOneOf } from "../config.js";
import { AuthenticatedRequest, requireAuth, requireShopOwner } from "../middleware/auth.middleware.js";
import { ownerService } from "../services/owner.service.js";
import { pickupService } from "../services/pickup.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { badRequest, notFound } from "../utils/api-error.js";
import { optionalNumber, optionalString, requiredNumber, requiredString } from "../utils/input.js";

export const ownerRouter = Router();
const missingShopMessage = "No shop is linked to this owner yet.";

ownerRouter.use(requireAuth, requireShopOwner);

const getOwnerUser = (request: AuthenticatedRequest) => request.authUser!;

const readShopType = (value: unknown) => {
  const type = requiredString(value, "type");

  if (!isOneOf(type, SHOP_TYPES)) {
    throw badRequest("Invalid shop type.");
  }

  return type;
};

const readStockStatus = (value: unknown) => {
  const stockStatus = optionalString(value) ?? "in_stock";

  if (!isOneOf(stockStatus, STOCK_STATUSES)) {
    throw badRequest("Invalid stockStatus.");
  }

  return stockStatus;
};

const readPickupStatus = (value: unknown) => {
  const status = requiredString(value, "status");

  if (!isOneOf(status, PICKUP_INTENT_STATUSES)) {
    throw badRequest("Invalid pickup intent status.");
  }

  return status;
};

const readInventoryInput = (body: Record<string, unknown>, productId = requiredString(body.productId, "productId")) => {
  const price = body.price === undefined ? 0 : requiredNumber(body.price, "price");

  return {
    productId,
    quantity: body.quantity === undefined ? 1 : requiredNumber(body.quantity, "quantity"),
    price,
    mrp: body.mrp === undefined ? price : requiredNumber(body.mrp, "mrp"),
    stockStatus: readStockStatus(body.stockStatus),
    imageUrl: optionalString(body.imageUrl)
  };
};

const getOwnerShopOrThrow = async (userId: string) => {
  const shop = await ownerService.getOwnerShop(userId);

  if (!shop) {
    throw notFound(missingShopMessage);
  }

  return shop;
};

ownerRouter.post("/shop", asyncHandler(async (request, response) => {
  const authUser = getOwnerUser(request as AuthenticatedRequest);

  const shop = await ownerService.createOwnerShop(authUser.id, {
    name: requiredString(request.body.name, "name"),
    type: readShopType(request.body.type),
    ownerName: optionalString(request.body.ownerName) ?? authUser.fullName,
    phone: requiredString(request.body.phone, "phone"),
    address: requiredString(request.body.address, "address"),
    latitude: requiredNumber(request.body.latitude, "latitude"),
    longitude: requiredNumber(request.body.longitude, "longitude"),
    serviceRadiusKm: optionalNumber(request.body.serviceRadiusKm, "serviceRadiusKm")
  });

  if (!shop) {
    throw badRequest("This owner already has a shop profile.");
  }

  response.status(201).json(shop);
}));

ownerRouter.get("/shop", asyncHandler(async (request, response) => {
  response.json(await getOwnerShopOrThrow(getOwnerUser(request as AuthenticatedRequest).id));
}));

ownerRouter.patch("/shop", asyncHandler(async (request, response) => {
  const authUser = getOwnerUser(request as AuthenticatedRequest);
  const type = optionalString(request.body.type);
  const latitude = optionalNumber(request.body.latitude, "latitude");
  const longitude = optionalNumber(request.body.longitude, "longitude");
  const serviceRadiusKm = optionalNumber(request.body.serviceRadiusKm, "serviceRadiusKm");

  if (type && !isOneOf(type, SHOP_TYPES)) {
    throw badRequest("Invalid shop type.");
  }

  const shopType = type as (typeof SHOP_TYPES)[number] | undefined;

  const updated = await ownerService.updateOwnerShop(authUser.id, {
    name: optionalString(request.body.name),
    type: shopType,
    ownerName: optionalString(request.body.ownerName),
    phone: optionalString(request.body.phone),
    address: optionalString(request.body.address),
    latitude,
    longitude,
    serviceRadiusKm
  });

  if (!updated) {
    throw notFound(missingShopMessage);
  }

  response.json(updated);
}));

ownerRouter.get("/inventory", asyncHandler(async (request, response) => {
  const authUser = getOwnerUser(request as AuthenticatedRequest);
  const inventory = await ownerService.getOwnerInventory(authUser.id);

  if (!inventory) {
    throw notFound(missingShopMessage);
  }

  response.json({ inventory });
}));

ownerRouter.post("/inventory", asyncHandler(async (request, response) => {
  const authUser = getOwnerUser(request as AuthenticatedRequest);
  const inventoryItem = await ownerService.upsertOwnerInventoryItem(authUser.id, readInventoryInput(request.body));

  if (!inventoryItem) {
    throw notFound("Owner shop or product not found.");
  }

  response.status(201).json(inventoryItem);
}));

ownerRouter.patch("/inventory/:productId", asyncHandler(async (request, response) => {
  const authUser = getOwnerUser(request as AuthenticatedRequest);
  const inventoryItem = await ownerService.upsertOwnerInventoryItem(
    authUser.id,
    readInventoryInput(request.body, request.params.productId)
  );

  if (!inventoryItem) {
    throw notFound("Owner shop or product not found.");
  }

  response.json(inventoryItem);
}));

ownerRouter.delete("/inventory/:productId", asyncHandler(async (request, response) => {
  const authUser = getOwnerUser(request as AuthenticatedRequest);
  const deleted = await ownerService.deleteOwnerInventoryItem(authUser.id, request.params.productId);

  if (!deleted) {
    throw notFound("Owner inventory item not found.");
  }

  response.status(204).send();
}));

ownerRouter.get("/analytics", asyncHandler(async (request, response) => {
  const authUser = getOwnerUser(request as AuthenticatedRequest);
  const analytics = await ownerService.getOwnerAnalytics(authUser.id);

  if (!analytics) {
    throw notFound(missingShopMessage);
  }

  response.json(analytics);
}));

ownerRouter.get("/pickup-intents", asyncHandler(async (request, response) => {
  const authUser = getOwnerUser(request as AuthenticatedRequest);
  const shop = await getOwnerShopOrThrow(authUser.id);

  response.json({
    pickupIntents: await pickupService.listShopIntents(shop.id)
  });
}));

ownerRouter.patch("/pickup-intents/:intentId", asyncHandler(async (request, response) => {
  const authUser = getOwnerUser(request as AuthenticatedRequest);
  const shop = await getOwnerShopOrThrow(authUser.id);
  const updated = await pickupService.updateIntentStatus(
    shop.id,
    request.params.intentId,
    readPickupStatus(request.body.status)
  );

  if (!updated) {
    throw notFound("Pickup intent not found.");
  }

  response.json(updated);
}));
