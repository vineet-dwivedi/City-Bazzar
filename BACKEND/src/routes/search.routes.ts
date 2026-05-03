// Search stays intentionally tiny: parse query params, then delegate.
import { Router } from "express";
import { discoveryService } from "../services/discovery.service.js";
import { rateLimit } from "../middleware/rate-limit.js";
import { asyncHandler } from "../utils/async-handler.js";
import { optionalNumber, requiredNumber, requiredString } from "../utils/input.js";

export const searchRouter = Router();

searchRouter.get("/products", rateLimit({ key: "search", limit: 90, windowMs: 60_000 }), asyncHandler(async (request, response) => {
  const query = requiredString(request.query.query, "query");
  const lat = requiredNumber(request.query.lat, "lat");
  const lng = requiredNumber(request.query.lng, "lng");
  const radiusKm = requiredNumber(request.query.radiusKm ?? process.env.DEFAULT_SEARCH_RADIUS_KM ?? 5, "radiusKm");
  const page = optionalNumber(request.query.page, "page");
  const pageSize = optionalNumber(request.query.pageSize, "pageSize");

  response.json(await discoveryService.searchProducts({ query, lat, lng, radiusKm, page, pageSize }));
}));
