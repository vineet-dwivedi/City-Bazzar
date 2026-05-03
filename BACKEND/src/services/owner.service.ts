// Owner service is a small owner-specific facade over the shop service.
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
    return shopService.registerOwnedShop(userId, input);
  }

  async getOwnerShop(userId: string) {
    return shopService.getOwnedShop(userId);
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
    return shopService.updateOwnedShop(userId, input);
  }

  async getOwnerInventory(userId: string) {
    return shopService.getOwnedInventory(userId);
  }

  async getOwnerInventoryPage(userId: string, options: {
    page?: number;
    pageSize?: number;
    query?: string;
    stockStatus?: "in_stock" | "low_stock" | "out_of_stock";
  }) {
    return shopService.getOwnedInventoryPage(userId, options);
  }

  async upsertOwnerInventoryItem(userId: string, input: {
    productId: string;
    stockStatus: "in_stock" | "low_stock" | "out_of_stock";
    quantity: number;
    price: number;
    mrp: number;
    imageUrl?: string;
  }) {
    return shopService.upsertOwnedInventoryItem(userId, input);
  }

  async deleteOwnerInventoryItem(userId: string, productId: string) {
    return shopService.deleteOwnedInventoryItem(userId, productId);
  }

  async getOwnerAnalytics(userId: string) {
    const shop = await shopService.getOwnedShop(userId);
    return shop ? shopService.getAnalytics(shop.id) : null;
  }
}

export const ownerService = new OwnerService();
