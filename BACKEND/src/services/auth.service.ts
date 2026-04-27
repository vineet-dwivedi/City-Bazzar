import { authStore } from "./auth-store.js";
import { hashPassword, signAuthToken, verifyPassword } from "../utils/auth.js";

class AuthService {
  async register(input: {
    fullName: string;
    email?: string;
    phone?: string;
    password: string;
    role?: "shop_owner" | "customer" | "admin";
  }) {
    const email = input.email?.trim().toLowerCase();
    const phone = input.phone?.trim();

    if (!email && !phone) {
      throw new Error("Either email or phone is required.");
    }

    if (email && (await authStore.findUserByEmail(email))) {
      throw new Error("A user with this email already exists.");
    }

    if (phone && (await authStore.findUserByPhone(phone))) {
      throw new Error("A user with this phone already exists.");
    }

    const user = await authStore.createUser({
      role: input.role ?? "shop_owner",
      fullName: input.fullName.trim(),
      email,
      phone,
      passwordHash: await hashPassword(input.password)
    });

    return {
      user,
      token: signAuthToken({ sub: user.id, role: user.role })
    };
  }

  async login(input: {
    email?: string;
    phone?: string;
    password: string;
  }) {
    const email = input.email?.trim().toLowerCase();
    const phone = input.phone?.trim();
    const user = email
      ? await authStore.findUserByEmail(email)
      : phone
        ? await authStore.findUserByPhone(phone)
        : undefined;

    if (!user) {
      throw new Error("Invalid credentials.");
    }

    const passwordHash = await authStore.getPasswordHash(user.id);

    if (!passwordHash || !(await verifyPassword(input.password, passwordHash))) {
      throw new Error("Invalid credentials.");
    }

    await authStore.touchLastLogin(user.id);
    const currentUser = await authStore.findUserById(user.id);

    if (!currentUser) {
      throw new Error("User could not be loaded after login.");
    }

    return {
      user: currentUser,
      token: signAuthToken({ sub: currentUser.id, role: currentUser.role })
    };
  }
}

export const authService = new AuthService();
