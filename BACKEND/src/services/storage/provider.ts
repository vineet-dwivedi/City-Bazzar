import { env } from "../../env.js";
import { CloudinaryStorageProvider } from "./cloudinary-storage.provider.js";
import { LocalStorageProvider } from "./local-storage.provider.js";

// Storage provider selection mirrors the AI provider pattern.
export const createStorageProvider = () =>
  env.fileStorageProvider === "cloudinary"
    ? new CloudinaryStorageProvider()
    : new LocalStorageProvider();
