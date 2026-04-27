import { Router } from "express";
import { onboardingService } from "../services/onboarding.service.js";
import { shopService } from "../services/shop.service.js";
import { asyncHandler } from "../utils/async-handler.js";

export const onboardingRouter = Router();

const allowedCategories = new Set([
  "grocery",
  "stationery",
  "pharmacy",
  "personal-care",
  "beverages",
  "snacks",
  "household"
]);
const allowedStockStatuses = new Set(["in_stock", "low_stock", "out_of_stock"]);

onboardingRouter.post("/analyze", asyncHandler(async (request, response) => {
  const imageUrl = String(request.body.imageUrl ?? "").trim();
  const rawText = typeof request.body.rawText === "string" ? request.body.rawText : undefined;
  const manualHint =
    typeof request.body.manualHint === "string" ? request.body.manualHint : undefined;
  const shopId = typeof request.body.shopId === "string" ? request.body.shopId : undefined;

  if (!imageUrl) {
    response.status(400).json({ message: "imageUrl is required." });
    return;
  }

  response.json(await onboardingService.analyze({ imageUrl, rawText, manualHint, shopId }));
}));

onboardingRouter.post("/confirm", asyncHandler(async (request, response) => {
  const shopId = String(request.body.shopId ?? "").trim();
  const name = String(request.body.name ?? "").trim();
  const brand = String(request.body.brand ?? "").trim();
  const category = request.body.category;
  const mrp = request.body.mrp !== undefined ? Number(request.body.mrp) : null;
  const price = request.body.price !== undefined ? Number(request.body.price) : null;
  const quantity = request.body.quantity !== undefined ? Number(request.body.quantity) : 1;
  const stockStatus = request.body.stockStatus ?? "in_stock";

  if (!shopId || !name || !brand || !category) {
    response
      .status(400)
      .json({ message: "shopId, name, brand, and category are required." });
    return;
  }

  if (!allowedCategories.has(String(category))) {
    response.status(400).json({
      message:
        "category must be grocery, stationery, pharmacy, personal-care, beverages, snacks, or household."
    });
    return;
  }

  if (!allowedStockStatuses.has(String(stockStatus))) {
    response.status(400).json({ message: "stockStatus must be in_stock, low_stock, or out_of_stock." });
    return;
  }

  if (
    (mrp !== null && Number.isNaN(mrp)) ||
    (price !== null && Number.isNaN(price)) ||
    Number.isNaN(quantity)
  ) {
    response.status(400).json({ message: "mrp, price, and quantity must be valid numbers." });
    return;
  }

  const result = await shopService.confirmOnboarding({
    shopId,
    catalogProductId:
      typeof request.body.catalogProductId === "string" ? request.body.catalogProductId : undefined,
    onboardingSessionId:
      typeof request.body.onboardingSessionId === "string"
        ? request.body.onboardingSessionId
        : undefined,
    name,
    brand,
    category,
    mrp,
    price,
    quantity,
    stockStatus,
    imageUrl: typeof request.body.imageUrl === "string" ? request.body.imageUrl : undefined,
    keywords: Array.isArray(request.body.keywords)
      ? request.body.keywords.filter((value: unknown): value is string => typeof value === "string")
      : []
  });

  if (!result) {
    response.status(404).json({ message: "Shop or product could not be linked." });
    return;
  }

  response.status(201).json(result);
}));
