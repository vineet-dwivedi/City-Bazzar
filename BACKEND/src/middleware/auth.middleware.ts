// Auth middleware keeps bearer-token handling in one place.
import { NextFunction, Request, Response } from "express";
import { User } from "../types.js";
import { dataStore } from "../services/store.js";
import { unauthorized, forbidden } from "../utils/api-error.js";
import { verifyAuthToken } from "../utils/auth.js";

export interface AuthenticatedRequest extends Request {
  authUser?: User;
}

export const requireAuth = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) => {
  try {
    const authorization = request.header("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      throw unauthorized("Authorization token is required.");
    }

    const token = authorization.slice("Bearer ".length);
    const payload = verifyAuthToken(token);
    const user = await dataStore.findUserById(payload.sub);

    if (!user) {
      throw unauthorized("User not found for this token.");
    }

    request.authUser = user;
    next();
  } catch {
    next(unauthorized("Invalid or expired token."));
  }
};

export const requireShopOwner = (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) => {
  if (!request.authUser) {
    next(unauthorized("Authentication required."));
    return;
  }

  if (request.authUser.role !== "shop_owner" && request.authUser.role !== "admin") {
    next(forbidden("Shop-owner access is required."));
    return;
  }

  next();
};
