export interface PublicRequestContext {
  protocol: string;
  get(name: string): string | undefined;
}

export interface StoredImage {
  key: string;
  imageUrl: string;
}

export interface StorageProvider {
  readonly mode: "local" | "cloudinary";
  saveProductImage(file: Express.Multer.File, request: PublicRequestContext): Promise<StoredImage>;
}
