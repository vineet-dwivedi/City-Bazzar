// Search stays intentionally tiny: parse query params, then delegate.
import { Router } from "express";
import { discoveryService } from "../services/discovery.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { requiredNumber, requiredString } from "../utils/input.js";

export const searchRouter = Router();

searchRouter.get("/products", asyncHandler(async (request, response) => {
  const query = requiredString(request.query.query, "query");
  const lat = requiredNumber(request.query.lat, "lat");
  const lng = requiredNumber(request.query.lng, "lng");
  const radiusKm = requiredNumber(request.query.radiusKm ?? process.env.DEFAULT_SEARCH_RADIUS_KM ?? 5, "radiusKm");

  response.json(await discoveryService.searchProducts({ query, lat, lng, radiusKm }));
}));
