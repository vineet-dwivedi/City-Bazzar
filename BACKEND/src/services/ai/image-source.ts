import path from "node:path";
import { readFile } from "node:fs/promises";
import { uploadService } from "../upload.service.js";

const mimeByExtension: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp"
};

const localhostHosts = new Set(["localhost", "127.0.0.1"]);

// Shared image helpers keep local uploads usable across providers.
export const resolveLocalUploadFile = (imageUrl: string) => {
  if (imageUrl.startsWith("data:")) {
    return undefined;
  }

  const parsed = tryParseUrl(imageUrl);
  const pathname = parsed?.pathname ?? (imageUrl.startsWith("/uploads/") ? imageUrl : "");

  if (!pathname.startsWith("/uploads/") && !pathname.includes("\\uploads\\") && !pathname.includes("/uploads/")) {
    return undefined;
  }

  return path.join(uploadService.getUploadDir(), path.basename(pathname));
};

export const resolveImageSourceForOcr = (imageUrl: string) =>
  resolveLocalUploadFile(imageUrl) ?? imageUrl;

export const toImageDataUrl = async (imageUrl: string) => {
  if (imageUrl.startsWith("data:")) {
    return imageUrl;
  }

  const filePath = resolveLocalUploadFile(imageUrl);

  if (!filePath) {
    return undefined;
  }

  const extension = path.extname(filePath).toLowerCase();
  const mimeType = mimeByExtension[extension] ?? "image/jpeg";
  const buffer = await readFile(filePath);
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
};

const tryParseUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return localhostHosts.has(parsed.hostname) ? parsed : undefined;
  } catch {
    return undefined;
  }
};
