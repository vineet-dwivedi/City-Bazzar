// Customer-side pickup intent route. This stays public for the MVP.
import { Router } from "express";
import { AuthenticatedRequest, requireAuth } from "../middleware/auth.middleware.js";
import { pickupService } from "../services/pickup.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { optionalString, requiredNumber, requiredString } from "../utils/input.js";

export const pickupRouter = Router();

pickupRouter.get("/mine", requireAuth, asyncHandler(async (request, response) => {
  const authUser = (request as AuthenticatedRequest).authUser!;

  response.json({
    pickupIntents: await pickupService.listCustomerIntents({
      customerUserId: authUser.id,
      customerPhone: authUser.phone,
    })
  });
}));

pickupRouter.post("/", asyncHandler(async (request, response) => {
  const intent = await pickupService.createIntent({
    shopId: requiredString(request.body.shopId, "shopId"),
    productId: requiredString(request.body.productId, "productId"),
    customerName: requiredString(request.body.customerName, "customerName"),
    customerPhone: requiredString(request.body.customerPhone, "customerPhone"),
    quantityRequested: requiredNumber(request.body.quantityRequested, "quantityRequested"),
    note: optionalString(request.body.note),
    customerUserId: optionalString(request.body.customerUserId),
  });

  response.status(201).json(intent);
}));
