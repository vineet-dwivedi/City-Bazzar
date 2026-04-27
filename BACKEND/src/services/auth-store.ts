import { randomUUID } from "node:crypto";
import { Db, MongoClient } from "mongodb";

type UserRole = "shop_owner" | "customer" | "admin";
type UserStatus = "active" | "pending_verification" | "disabled";

export interface AuthUser {
  id: string;
  role: UserRole;
  fullName: string;
  email?: string;
  phone?: string;
  isVerified: boolean;
  status: UserStatus;
  lastLoginAt?: string;
  createdAt: string;
}

interface StoredUser extends AuthUser {
  passwordHash: string;
  updatedAt: string;
}

interface OwnerShopLink {
  userId: string;
  shopId: string;
  linkedAt: string;
}

const memoryUsers: StoredUser[] = [];
const ownerShopLinks: OwnerShopLink[] = [];

let mongoClientPromise: Promise<MongoClient> | undefined;

const getMongoClient = async () => {
  if (!mongoClientPromise) {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is required when DATA_STORE_MODE=mongo.");
    }

    const client = new MongoClient(uri);
    mongoClientPromise = client.connect();
  }

  return mongoClientPromise;
};

const getMongoDb = async (): Promise<Db> => {
  const client = await getMongoClient();
  return client.db(process.env.MONGODB_DB_NAME ?? "city_bazaar");
};

class AuthStore {
  async initialize() {
    if (process.env.DATA_STORE_MODE !== "mongo") {
      return;
    }

    const db = await getMongoDb();
    await db.collection<StoredUser>("users").createIndex({ email: 1 }, { unique: true, sparse: true });
    await db.collection<StoredUser>("users").createIndex({ phone: 1 }, { unique: true, sparse: true });
    await db.collection<OwnerShopLink>("owner_shop_links").createIndex({ userId: 1 }, { unique: true });
  }

  async createUser(input: {
    role: UserRole;
    fullName: string;
    email?: string;
    phone?: string;
    passwordHash: string;
  }) {
    const now = new Date().toISOString();
    const user: StoredUser = {
      id: `user-${randomUUID()}`,
      role: input.role,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      passwordHash: input.passwordHash,
      isVerified: true,
      status: "active",
      createdAt: now,
      updatedAt: now
    };

    if (process.env.DATA_STORE_MODE === "mongo") {
      const db = await getMongoDb();
      await db.collection<StoredUser>("users").insertOne(user);
      return this.toPublicUser(user);
    }

    memoryUsers.push(user);
    return this.toPublicUser(user);
  }

  async findUserById(userId: string) {
    const user = process.env.DATA_STORE_MODE === "mongo"
      ? await (await getMongoDb()).collection<StoredUser>("users").findOne({ id: userId })
      : memoryUsers.find((entry) => entry.id === userId);

    return user ? this.toPublicUser(user) : undefined;
  }

  async findUserByEmail(email: string) {
    const normalized = email.toLowerCase();
    const user = process.env.DATA_STORE_MODE === "mongo"
      ? await (await getMongoDb()).collection<StoredUser>("users").findOne({ email: normalized })
      : memoryUsers.find((entry) => entry.email === normalized);

    return user ? this.toPublicUser(user) : undefined;
  }

  async findUserByPhone(phone: string) {
    const user = process.env.DATA_STORE_MODE === "mongo"
      ? await (await getMongoDb()).collection<StoredUser>("users").findOne({ phone })
      : memoryUsers.find((entry) => entry.phone === phone);

    return user ? this.toPublicUser(user) : undefined;
  }

  async getPasswordHash(userId: string) {
    const user = process.env.DATA_STORE_MODE === "mongo"
      ? await (await getMongoDb()).collection<StoredUser>("users").findOne({ id: userId })
      : memoryUsers.find((entry) => entry.id === userId);

    return user?.passwordHash;
  }

  async touchLastLogin(userId: string) {
    const now = new Date().toISOString();

    if (process.env.DATA_STORE_MODE === "mongo") {
      await (await getMongoDb()).collection<StoredUser>("users").updateOne(
        { id: userId },
        { $set: { lastLoginAt: now, updatedAt: now } }
      );
      return;
    }

    const user = memoryUsers.find((entry) => entry.id === userId);

    if (user) {
      user.lastLoginAt = now;
      user.updatedAt = now;
    }
  }

  async findOwnerShopId(userId: string) {
    const link = process.env.DATA_STORE_MODE === "mongo"
      ? await (await getMongoDb()).collection<OwnerShopLink>("owner_shop_links").findOne({ userId })
      : ownerShopLinks.find((entry) => entry.userId === userId);

    return link?.shopId;
  }

  async linkOwnerShop(userId: string, shopId: string) {
    const link: OwnerShopLink = {
      userId,
      shopId,
      linkedAt: new Date().toISOString()
    };

    if (process.env.DATA_STORE_MODE === "mongo") {
      await (await getMongoDb()).collection<OwnerShopLink>("owner_shop_links").insertOne(link);
      return;
    }

    ownerShopLinks.push(link);
  }

  private toPublicUser(user: StoredUser): AuthUser {
    return {
      id: user.id,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      isVerified: user.isVerified,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt
    };
  }
}

export const authStore = new AuthStore();
