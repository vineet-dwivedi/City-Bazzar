// Auth routes only parse input and delegate real work to the auth service.
import { Router } from "express";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { rateLimit } from "../middleware/rate-limit.js";
import { authService } from "../services/auth.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { optionalString, requiredString } from "../utils/input.js";
import { badRequest } from "../utils/api-error.js";

export const authRouter = Router();

authRouter.post("/register", rateLimit({ key: "auth-register", limit: 15, windowMs: 60_000 }), asyncHandler(async (request, response) => {
  const fullName = requiredString(request.body.fullName, "fullName");
  const password = requiredString(request.body.password, "password");
  const email = optionalString(request.body.email);
  const phone = optionalString(request.body.phone);
  const role = optionalString(request.body.role);

  if (role && !["shop_owner", "customer", "admin"].includes(role)) {
    throw badRequest("role must be shop_owner, customer, or admin.");
  }

  response.status(201).json(await authService.register({
    fullName,
    email,
    phone,
    password,
    role: role as "shop_owner" | "customer" | "admin" | undefined
  }));
}));

authRouter.post("/login", rateLimit({ key: "auth-login", limit: 25, windowMs: 60_000 }), asyncHandler(async (request, response) => {
  const email = optionalString(request.body.email);
  const phone = optionalString(request.body.phone);
  const password = requiredString(request.body.password, "password");

  if (!email && !phone) {
    throw badRequest("email or phone is required.");
  }

  response.json(await authService.login({ email, phone, password }));
}));

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (request, response) => {
    response.json((request as AuthenticatedRequest).authUser);
  })
);
