import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { env } from "../../env.js";
import { PublicRequestContext, StorageProvider } from "./provider.types.js";

// Local disk stays the simplest default and remains test-friendly.
export class LocalStorageProvider implements StorageProvider {
  readonly mode = "local" as const;

  getUploadDir() {
    return env.uploadDir;
  }

  async saveProductImage(file: Express.Multer.File, request: PublicRequestContext) {
    const extension = this.resolveExtension(file);
    const filename = `product-${randomUUID()}${extension}`;
    const uploadDir = this.getUploadDir();
    const filePath = path.join(uploadDir, filename);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(filePath, file.buffer);

    return {
      key: filename,
      imageUrl: `${request.protocol}://${request.get("host")}/uploads/${filename}`
    };
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
