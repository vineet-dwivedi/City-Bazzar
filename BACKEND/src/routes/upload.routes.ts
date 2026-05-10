import { Router } from "express";
import multer from "multer";
import { requireAuth, requireShopOwner } from "../middleware/auth.middleware.js";
import { rateLimit } from "../middleware/rate-limit.js";
import { asyncHandler } from "../utils/async-handler.js";
import { badRequest } from "../utils/api-error.js";
import { uploadService } from "../services/upload.service.js";

export const uploadRouter = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: uploadService.getMaxFileSizeBytes() },
  fileFilter: (_request, file, callback) => {
    if (!uploadService.getAllowedMimeTypes().includes(file.mimetype)) {
      callback(badRequest("Only JPG, PNG, or WEBP images are allowed."));
      return;
    }

    callback(null, true);
  }
});

uploadRouter.post(
  "/product-image",
  requireAuth,
  requireShopOwner,
  rateLimit({ key: "upload", limit: 20, windowMs: 60_000 }),
  upload.single("image"),
  asyncHandler(async (request, response) => {
    if (!request.file) {
      throw badRequest("image is required.");
    }

    const uploaded = await uploadService.saveProductImage(request.file, request);

    response.status(201).json({
      imageUrl: uploaded.imageUrl,
      key: uploaded.key,
      storage: uploadService.getStorageMode()
    });
  })
);
