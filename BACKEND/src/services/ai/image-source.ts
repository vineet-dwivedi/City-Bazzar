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

export const toInlineImageData = async (imageUrl: string) => {
  const dataUrl = await toImageDataUrl(imageUrl) ?? await fetchAsDataUrl(imageUrl);
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);

  if (!match) {
    throw new Error("Image could not be converted to inline base64 data.");
  }

  return {
    mimeType: match[1],
    data: match[2]
  };
};

const tryParseUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return localhostHosts.has(parsed.hostname) ? parsed : undefined;
  } catch {
    return undefined;
  }
};

const fetchAsDataUrl = async (imageUrl: string) => {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Image fetch failed (${response.status}).`);
  }

  const mimeType = response.headers.get("content-type")?.split(";")[0] ?? "image/jpeg";
  const buffer = Buffer.from(await response.arrayBuffer());
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
};
