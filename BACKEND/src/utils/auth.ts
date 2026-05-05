// Password and token helpers stay isolated from route code.
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../env.js";

export interface AuthTokenPayload {
  sub: string;
  role: "shop_owner" | "customer" | "admin";
}

const getJwtSecret = () => {
  const secret = env.jwtSecret;

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
    expiresIn: env.authTokenExpiresIn as SignOptions["expiresIn"]
  });

export const verifyAuthToken = (token: string) =>
  jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
