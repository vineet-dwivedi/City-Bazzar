import { v2 as cloudinary } from "cloudinary";
import { env } from "../../env.js";
import { PublicRequestContext, StorageProvider } from "./provider.types.js";

// Cloudinary gives us persistent hosted image URLs without changing the API shape.
export class CloudinaryStorageProvider implements StorageProvider {
  readonly mode = "cloudinary" as const;

  constructor() {
    cloudinary.config({
      cloud_name: env.cloudinaryCloudName,
      api_key: env.cloudinaryApiKey,
      api_secret: env.cloudinaryApiSecret,
      secure: true
    });
  }

  async saveProductImage(file: Express.Multer.File, _request: PublicRequestContext) {
    const result = await new Promise<{
      public_id: string;
      secure_url: string;
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: env.cloudinaryFolder,
          resource_type: "image",
          unique_filename: true,
          overwrite: false
        },
        (error, uploaded) => {
          if (error || !uploaded) {
            reject(error ?? new Error("Cloudinary upload failed."));
            return;
          }

          resolve({
            public_id: uploaded.public_id,
            secure_url: uploaded.secure_url
          });
        }
      );

      stream.end(file.buffer);
    });

    return {
      key: result.public_id,
      imageUrl: result.secure_url
    };
  }
}
