// Public shop routes are read-focused so customers can browse safely.
import { Router } from "express";
import { discoveryService } from "../services/discovery.service.js";
import { shopService } from "../services/shop.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { badRequest, notFound } from "../utils/api-error.js";
import { optionalNumber, optionalString } from "../utils/input.js";

export const shopRouter = Router();

shopRouter.get("/", asyncHandler(async (request, response) => {
  const lat = optionalNumber(request.query.lat, "lat");
  const lng = optionalNumber(request.query.lng, "lng");
  const radiusKm = optionalNumber(request.query.radiusKm, "radiusKm");
  const query = optionalString(request.query.query);

  response.json({
    shops: await discoveryService.listShops({ lat, lng, radiusKm, query })
  });
}));

shopRouter.get("/:shopId", asyncHandler(async (request, response) => {
  const shop = await shopService.getShop(request.params.shopId);

  if (!shop) {
    throw notFound("Shop not found.");
  }

  response.json(shop);
}));

shopRouter.get("/:shopId/analytics", asyncHandler(async (request, response) => {
  const analytics = await shopService.getAnalytics(request.params.shopId);

  if (!analytics) {
    throw notFound("Shop not found.");
  }

  response.json(analytics);
}));

shopRouter.post("/:shopId/events", asyncHandler(async (request, response) => {
  const type = request.body.type;

  if (type !== "view" && type !== "click") {
    throw badRequest("Event type must be view or click.");
  }

  const analytics = await shopService.recordEvent(request.params.shopId, type);

  if (!analytics) {
    throw notFound("Shop not found.");
  }

  response.status(201).json(analytics);
}));
