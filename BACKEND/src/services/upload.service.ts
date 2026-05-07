import { env } from "../env.js";
import { badRequest } from "../utils/api-error.js";
import { createStorageProvider } from "./storage/provider.js";
import { LocalStorageProvider } from "./storage/local-storage.provider.js";
import { PublicRequestContext } from "./storage/provider.types.js";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

// Upload service keeps validation centralized and storage-provider agnostic.
class UploadService {
  private readonly provider = createStorageProvider();

  getAllowedMimeTypes() {
    return [...allowedMimeTypes];
  }

  getMaxFileSizeBytes() {
    return env.uploadMaxFileSizeBytes;
  }

  getStorageMode() {
    return this.provider.mode;
  }

  getUploadDir() {
    return this.provider instanceof LocalStorageProvider
      ? this.provider.getUploadDir()
      : env.uploadDir;
  }

  usesLocalDisk() {
    return this.provider.mode === "local";
  }

  async saveProductImage(file: Express.Multer.File, request: PublicRequestContext) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      throw badRequest("Only JPG, PNG, or WEBP images are allowed.");
    }

    if (file.size > env.uploadMaxFileSizeBytes) {
      throw badRequest(`Image must be smaller than ${Math.round(env.uploadMaxFileSizeBytes / (1024 * 1024))} MB.`);
    }

    return this.provider.saveProductImage(file, request);
  }
}

export const uploadService = new UploadService();
