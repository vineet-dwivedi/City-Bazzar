import { Router } from "express";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { authService } from "../services/auth.service.js";
import { asyncHandler } from "../utils/async-handler.js";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(async (request, response) => {
  const fullName = String(request.body.fullName ?? "").trim();
  const email = request.body.email !== undefined ? String(request.body.email) : undefined;
  const phone = request.body.phone !== undefined ? String(request.body.phone) : undefined;
  const password = String(request.body.password ?? "");
  const role = request.body.role !== undefined ? String(request.body.role) : undefined;

  if (!fullName || !password) {
    response.status(400).json({ message: "fullName and password are required." });
    return;
  }

  if (role && !["shop_owner", "customer", "admin"].includes(role)) {
    response.status(400).json({ message: "role must be shop_owner, customer, or admin." });
    return;
  }

  response.status(201).json(await authService.register({
    fullName,
    email,
    phone,
    password,
    role: role as "shop_owner" | "customer" | "admin" | undefined
  }));
}));

authRouter.post("/login", asyncHandler(async (request, response) => {
  const email = request.body.email !== undefined ? String(request.body.email) : undefined;
  const phone = request.body.phone !== undefined ? String(request.body.phone) : undefined;
  const password = String(request.body.password ?? "");

  if ((!email && !phone) || !password) {
    response.status(400).json({ message: "email or phone, plus password, is required." });
    return;
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
