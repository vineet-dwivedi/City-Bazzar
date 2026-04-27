// Auth service owns registration and login rules.
import { dataStore } from "./store.js";
import { badRequest, conflict, unauthorized } from "../utils/api-error.js";
import { hashPassword, signAuthToken, verifyPassword } from "../utils/auth.js";

class AuthService {
  async register(input: {
    fullName: string;
    email?: string;
    phone?: string;
    password: string;
    role?: "shop_owner" | "customer" | "admin";
  }) {
    // Normalize identifiers early so duplicates are checked consistently.
    const email = input.email?.trim().toLowerCase();
    const phone = input.phone?.trim();

    if (!email && !phone) {
      throw badRequest("Either email or phone is required.");
    }

    if (email && (await dataStore.findUserByEmail(email))) {
      throw conflict("A user with this email already exists.");
    }

    if (phone && (await dataStore.findUserByPhone(phone))) {
      throw conflict("A user with this phone already exists.");
    }

    const user = await dataStore.createUser({
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
    // Login supports either email or phone to keep onboarding flexible.
    const email = input.email?.trim().toLowerCase();
    const phone = input.phone?.trim();
    const user = email
      ? await dataStore.findUserByEmail(email)
      : phone
        ? await dataStore.findUserByPhone(phone)
        : undefined;

    if (!user) {
      throw unauthorized("Invalid credentials.");
    }

    const passwordHash = await dataStore.getPasswordHash(user.id);

    if (!passwordHash || !(await verifyPassword(input.password, passwordHash))) {
      throw unauthorized("Invalid credentials.");
    }

    await dataStore.touchUserLogin(user.id);
    const currentUser = await dataStore.findUserById(user.id);

    if (!currentUser) {
      throw unauthorized("User could not be loaded after login.");
    }

    return {
      user: currentUser,
      token: signAuthToken({ sub: currentUser.id, role: currentUser.role })
    };
  }
}

export const authService = new AuthService();
