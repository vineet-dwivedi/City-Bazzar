import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";

export interface AuthTokenPayload {
  sub: string;
  role: "shop_owner" | "customer" | "admin";
}

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is required for auth routes.");
  }

  return secret;
};

export const hashPassword = async (password: string) => bcrypt.hash(password, 10);
export const verifyPassword = async (password: string, passwordHash: string) =>
  bcrypt.compare(password, passwordHash);

export const signAuthToken = (payload: AuthTokenPayload) =>
  jwt.sign(payload, getJwtSecret(), {
    expiresIn: (process.env.AUTH_TOKEN_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"]
  });

export const verifyAuthToken = (token: string) =>
  jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
