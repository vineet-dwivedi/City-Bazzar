// Catalog routes are read-only in the MVP.
import { Router } from "express";
import { catalogService } from "../services/catalog.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { notFound } from "../utils/api-error.js";

export const catalogRouter = Router();

catalogRouter.get("/", asyncHandler(async (_request, response) => {
  response.json({ products: await catalogService.list() });
}));

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

catalogRouter.get("/:productId", asyncHandler(async (request, response) => {
  const product = await catalogService.findById(request.params.productId);

  if (!product) {
    throw notFound("Product not found.");
  }

  response.json(product);
}));
