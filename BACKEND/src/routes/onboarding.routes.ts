// Onboarding routes handle AI analysis and the final owner-confirmed save.
import { Router } from "express";
import { PRODUCT_CATEGORIES, STOCK_STATUSES, isOneOf } from "../config.js";
import { AuthenticatedRequest, requireAuth, requireShopOwner } from "../middleware/auth.middleware.js";
import { rateLimit } from "../middleware/rate-limit.js";
import { ownerService } from "../services/owner.service.js";
import { onboardingService } from "../services/onboarding.service.js";
import { shopService } from "../services/shop.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { badRequest, notFound } from "../utils/api-error.js";
import { optionalNumber, optionalString, requiredNumber, requiredString, stringList } from "../utils/input.js";

export const onboardingRouter = Router();

onboardingRouter.post("/analyze", rateLimit({ key: "onboarding-analyze", limit: 30, windowMs: 60_000 }), asyncHandler(async (request, response) => {
  const imageUrl = requiredString(request.body.imageUrl, "imageUrl");
  const rawText = optionalString(request.body.rawText);
  const manualHint = optionalString(request.body.manualHint);
  const shopId = optionalString(request.body.shopId);

  response.json(await onboardingService.analyze({ imageUrl, rawText, manualHint, shopId }));
}));

onboardingRouter.post("/confirm", requireAuth, requireShopOwner, rateLimit({ key: "onboarding-confirm", limit: 30, windowMs: 60_000 }), asyncHandler(async (request, response) => {
  const authUser = (request as AuthenticatedRequest).authUser!;
  const shop = await ownerService.getOwnerShop(authUser.id);

  if (!shop) {
    throw notFound("Create your shop before confirming onboarding.");
  }

  const name = requiredString(request.body.name, "name");
  const brand = requiredString(request.body.brand, "brand");
  const category = requiredString(request.body.category, "category");
  const stockStatus = optionalString(request.body.stockStatus) ?? "in_stock";
  const mrp = optionalNumber(request.body.mrp, "mrp") ?? null;
  const price = optionalNumber(request.body.price, "price") ?? null;
  const quantity = request.body.quantity === undefined ? 1 : requiredNumber(request.body.quantity, "quantity");

  if (!isOneOf(category, PRODUCT_CATEGORIES)) {
    throw badRequest("Invalid category.");
  }

  if (!isOneOf(stockStatus, STOCK_STATUSES)) {
    throw badRequest("Invalid stockStatus.");
  }

  const result = await shopService.confirmOnboarding({
    shopId: shop.id,
    catalogProductId: optionalString(request.body.catalogProductId),
    onboardingSessionId: optionalString(request.body.onboardingSessionId),
    name,
    brand,
    category,
    mrp,
    price,
    quantity,
    stockStatus,
    imageUrl: optionalString(request.body.imageUrl),
    keywords: stringList(request.body.keywords)
  });

  if (!result) {
    throw notFound("Shop or product could not be linked.");
  }

  response.status(201).json(result);
}));
