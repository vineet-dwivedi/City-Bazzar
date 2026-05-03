import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { badRequest } from "../utils/api-error.js";

const defaultUploadDir = path.resolve(process.cwd(), "uploads");
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileSizeBytes = Number(process.env.UPLOAD_MAX_FILE_SIZE_MB ?? 5) * 1024 * 1024;

// Local disk storage keeps production wiring simple until cloud storage is added.
class UploadService {
  getUploadDir() {
    return process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : defaultUploadDir;
  }

  async saveProductImage(file: Express.Multer.File) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      throw badRequest("Only JPG, PNG, or WEBP images are allowed.");
    }

    if (file.size > maxFileSizeBytes) {
      throw badRequest(`Image must be smaller than ${Math.round(maxFileSizeBytes / (1024 * 1024))} MB.`);
    }

    const uploadDir = this.getUploadDir();
    await mkdir(uploadDir, { recursive: true });

    const extension = this.resolveExtension(file);
    const filename = `product-${randomUUID()}${extension}`;
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, file.buffer);

    return {
      filename,
      filePath
    };
  }

  buildPublicUrl(request: { protocol: string; get(name: string): string | undefined }, filename: string) {
    const host = request.get("host");
    return `${request.protocol}://${host}/uploads/${filename}`;
  }

  private resolveExtension(file: Express.Multer.File) {
    if (file.mimetype === "image/png") {
      return ".png";
    }

    if (file.mimetype === "image/webp") {
      return ".webp";
    }

    return ".jpg";
  }
}

export const uploadService = new UploadService();
