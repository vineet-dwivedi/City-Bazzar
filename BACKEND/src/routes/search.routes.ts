import { Router } from "express";
import { discoveryService } from "../services/discovery.service.js";
import { asyncHandler } from "../utils/async-handler.js";

export const searchRouter = Router();

searchRouter.get("/products", asyncHandler(async (request, response) => {
  const query = String(request.query.query ?? "").trim();
  const lat = Number(request.query.lat);
  const lng = Number(request.query.lng);
  const radiusKm = Number(request.query.radiusKm ?? process.env.DEFAULT_SEARCH_RADIUS_KM ?? 5);

  if (!query) {
    response.status(400).json({ message: "Query is required." });
    return;
  }

  if (Number.isNaN(lat) || Number.isNaN(lng) || Number.isNaN(radiusKm)) {
    response.status(400).json({ message: "Valid lat, lng, and radiusKm are required." });
    return;
  }

  response.json(await discoveryService.searchProducts({ query, lat, lng, radiusKm }));
}));
