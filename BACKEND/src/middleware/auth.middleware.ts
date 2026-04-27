import { NextFunction, Request, Response } from "express";
import { authStore, AuthUser } from "../services/auth-store.js";
import { verifyAuthToken } from "../utils/auth.js";

export interface AuthenticatedRequest extends Request {
  authUser?: AuthUser;
}

export const requireAuth = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) => {
  const authorization = request.header("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    response.status(401).json({ message: "Authorization token is required." });
    return;
  }

  try {
    const token = authorization.slice("Bearer ".length);
    const payload = verifyAuthToken(token);
    const user = await authStore.findUserById(payload.sub);

    if (!user) {
      response.status(401).json({ message: "User not found for this token." });
      return;
    }

    request.authUser = user;
    next();
  } catch {
    response.status(401).json({ message: "Invalid or expired token." });
  }
};

export const requireShopOwner = (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) => {
  if (!request.authUser) {
    response.status(401).json({ message: "Authentication required." });
    return;
  }

  if (request.authUser.role !== "shop_owner" && request.authUser.role !== "admin") {
    response.status(403).json({ message: "Shop-owner access is required." });
    return;
  }

  next();
};
