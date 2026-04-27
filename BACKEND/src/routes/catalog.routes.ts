import { Router } from "express";
import { catalogService } from "../services/catalog.service.js";
import { asyncHandler } from "../utils/async-handler.js";

export const catalogRouter = Router();

catalogRouter.get("/search", asyncHandler(async (request, response) => {
  const query = String(request.query.query ?? "").trim();

  if (!query) {
    response.status(400).json({ message: "Query is required." });
    return;
  }

  response.json({
    query,
    matches: await catalogService.search(query)
  });
}));
