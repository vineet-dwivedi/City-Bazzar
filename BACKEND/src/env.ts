import path from "node:path";
import { DEFAULT_DB_NAME } from "./config.js";

type StoreMode = "memory" | "mongo";
type AiProviderMode = "local" | "tesseract" | "gemini";
type FileStorageProviderMode = "local" | "cloudinary";

const readString = (value: string | undefined, fallback?: string) => {
  const normalized = value?.trim();
  return normalized || fallback;
};

const readNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value ?? fallback);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid numeric environment value: ${value}`);
  }

  return parsed;
};

const readBoolean = (value: string | undefined, fallback = false) =>
  value === undefined ? fallback : value === "true";

const readChoice = <T extends string>(value: string | undefined, allowed: readonly T[], fallback: T) => {
  const candidate = (value ?? fallback).toLowerCase() as T;

  if (!allowed.includes(candidate)) {
    throw new Error(`Invalid environment value "${value}". Allowed: ${allowed.join(", ")}`);
  }

  return candidate;
};

const readCorsOrigins = (value: string | undefined, isProduction: boolean) => {
  if (!value) {
    return isProduction ? [] : ["*"];
  }

  if (value.trim() === "*") {
    return ["*"];
  }

  return value.split(",").map((entry) => entry.trim()).filter(Boolean);
};

const nodeEnv = readString(process.env.NODE_ENV, "development")!;
const isProduction = nodeEnv === "production";
const dataStoreMode = readChoice(process.env.DATA_STORE_MODE, ["memory", "mongo"] as const, "memory");
const aiProvider = readChoice(process.env.AI_PROVIDER, ["local", "tesseract", "gemini"] as const, "local");
const fileStorageProvider = readChoice(process.env.FILE_STORAGE_PROVIDER, ["local", "cloudinary"] as const, "local");
const jwtSecret = readString(process.env.JWT_SECRET, "change-this-in-real-use")!;
const uploadMaxFileSizeMb = readNumber(process.env.UPLOAD_MAX_FILE_SIZE_MB, 5);

export const env = {
  nodeEnv,
  isProduction,
  port: readNumber(process.env.PORT, 4000),
  requestBodyLimitMb: readNumber(process.env.REQUEST_BODY_LIMIT_MB, 2),
  trustProxy: readBoolean(process.env.TRUST_PROXY, false),
  dataStoreMode: dataStoreMode as StoreMode,
  mongoUri: readString(process.env.MONGODB_URI),
  mongoDbName: readString(process.env.MONGODB_DB_NAME, DEFAULT_DB_NAME)!,
  mongoSeedOnStart: readBoolean(process.env.MONGODB_SEED_ON_START, true),
  jwtSecret,
  authTokenExpiresIn: readString(process.env.AUTH_TOKEN_EXPIRES_IN, "7d")!,
  corsOrigins: readCorsOrigins(process.env.CORS_ORIGINS, isProduction),
  uploadDir: path.resolve(readString(process.env.UPLOAD_DIR, "./uploads")!),
  uploadMaxFileSizeMb,
  uploadMaxFileSizeBytes: uploadMaxFileSizeMb * 1024 * 1024,
  aiProvider: aiProvider as AiProviderMode,
  fileStorageProvider: fileStorageProvider as FileStorageProviderMode,
  cloudinaryCloudName: readString(process.env.CLOUDINARY_CLOUD_NAME),
  cloudinaryApiKey: readString(process.env.CLOUDINARY_API_KEY),
  cloudinaryApiSecret: readString(process.env.CLOUDINARY_API_SECRET),
  cloudinaryFolder: readString(process.env.CLOUDINARY_FOLDER, "urbnbzr/products")!,
  geminiApiKey: readString(process.env.GEMINI_API_KEY),
  geminiModel: readString(process.env.GEMINI_MODEL, "gemini-2.5-flash")!,
  geminiBaseUrl: readString(process.env.GEMINI_BASE_URL, "https://generativelanguage.googleapis.com/v1beta")!
};

// One validation pass keeps startup errors clear instead of failing mid-request.
export const validateEnv = () => {
  if (!env.jwtSecret) {
    throw new Error("JWT_SECRET is required.");
  }

  if (env.isProduction && env.jwtSecret === "change-this-in-real-use") {
    throw new Error("JWT_SECRET must be changed before production deployment.");
  }

  if (env.dataStoreMode === "mongo" && !env.mongoUri) {
    throw new Error("MONGODB_URI is required when DATA_STORE_MODE=mongo.");
  }

  if (env.aiProvider === "gemini" && !env.geminiApiKey) {
    throw new Error("GEMINI_API_KEY is required when AI_PROVIDER=gemini.");
  }

  if (env.fileStorageProvider === "cloudinary") {
    if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
      throw new Error("Cloudinary credentials are required when FILE_STORAGE_PROVIDER=cloudinary.");
    }
  }
};
