import { authStore } from "./auth-store.js";
import { shopService } from "./shop.service.js";

class OwnerService {
  async createOwnerShop(userId: string, input: {
    name: string;
    type: "kirana" | "stationery" | "pharmacy" | "general-store";
    ownerName: string;
    phone: string;
    address: string;
    latitude: number;
    longitude: number;
    serviceRadiusKm?: number;
  }) {
    const existingShopId = await authStore.findOwnerShopId(userId);

    if (existingShopId) {
      return null;
    }

    const shop = await shopService.registerShop(input);
    await authStore.linkOwnerShop(userId, shop.id);
    return shop;
  }

  async getOwnerShop(userId: string) {
    const shopId = await authStore.findOwnerShopId(userId);
    return shopId ? shopService.getShop(shopId) : null;
  }

  async updateOwnerShop(userId: string, input: {
    name?: string;
    type?: "kirana" | "stationery" | "pharmacy" | "general-store";
    ownerName?: string;
    phone?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    serviceRadiusKm?: number;
  }) {
    const shopId = await authStore.findOwnerShopId(userId);
    return shopId ? shopService.updateShopProfile(shopId, input) : null;
  }

  async getOwnerInventory(userId: string) {
    const shopId = await authStore.findOwnerShopId(userId);

    if (!shopId) {
      return null;
    }

    const shop = await shopService.getShop(shopId);
    return shop?.inventory ?? [];
  }

  async upsertOwnerInventoryItem(userId: string, input: {
    productId: string;
    stockStatus: "in_stock" | "low_stock" | "out_of_stock";
    quantity: number;
    price: number;
    mrp: number;
    imageUrl?: string;
  }) {
    const shopId = await authStore.findOwnerShopId(userId);
    return shopId ? shopService.upsertInventoryItem(shopId, input) : null;
  }

  async deleteOwnerInventoryItem(userId: string, productId: string) {
    const shopId = await authStore.findOwnerShopId(userId);
    return shopId ? shopService.deleteInventoryItem(shopId, productId) : false;
  }
}

export const ownerService = new OwnerService();
