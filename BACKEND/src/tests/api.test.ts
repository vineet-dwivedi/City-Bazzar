process.env.NODE_ENV = "test";
process.env.DATA_STORE_MODE = "memory";
process.env.JWT_SECRET = "test-secret";
process.env.AUTH_TOKEN_EXPIRES_IN = "7d";
process.env.AI_PROVIDER = "local";
process.env.CORS_ORIGINS = "http://localhost:3000";
process.env.UPLOAD_DIR = "./.tmp-uploads";

import assert from "node:assert/strict";
import test, { before, beforeEach, after } from "node:test";
import { rm } from "node:fs/promises";
import path from "node:path";
import request from "supertest";

const { app } = await import("../app.js");
const { initializeDataStore, resetDataStoreForTests } = await import("../services/store.js");
const { resetRateLimitsForTests } = await import("../middleware/rate-limit.js");

const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9sazcVQAAAAASUVORK5CYII=",
  "base64"
);

before(async () => {
  await initializeDataStore();
});

beforeEach(async () => {
  resetRateLimitsForTests();
  await resetDataStoreForTests();
});

after(async () => {
  await rm(path.resolve("./.tmp-uploads"), { recursive: true, force: true });
});

const registerOwner = async () => {
  const response = await request(app).post("/api/auth/register").send({
    fullName: "Demo Owner",
    email: `owner-${Date.now()}@test.local`,
    phone: `${Math.floor(Math.random() * 1_000_000_0000)}`,
    password: "Demo123!",
    role: "shop_owner"
  });

  assert.equal(response.status, 201);
  return response.body as { token: string; user: { id: string } };
};

const createOwnerShop = async (token: string) => {
  const response = await request(app).post("/api/owner/shop")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Urban Health Store",
      type: "pharmacy",
      ownerName: "Demo Owner",
      phone: "9998887776",
      address: "12 Residency Road, Bengaluru",
      latitude: 12.9716,
      longitude: 77.5946,
      serviceRadiusKm: 6
    });

  assert.equal(response.status, 201);
  return response.body as { id: string; latitude: number; longitude: number };
};

test("health endpoints expose service and readiness state", async () => {
  const health = await request(app).get("/api/health").set("Origin", "http://localhost:3000");
  assert.equal(health.status, 200);
  assert.equal(health.body.ok, true);
  assert.equal(health.headers["access-control-allow-origin"], "http://localhost:3000");
  assert.equal(health.headers["x-content-type-options"], "nosniff");

  const readiness = await request(app).get("/api/health/ready");
  assert.equal(readiness.status, 200);
  assert.equal(readiness.body.ok, true);
  assert.equal(readiness.body.store.mode, "memory");
});

test("auth flow registers an owner and returns the current user", async () => {
  const auth = await registerOwner();
  const me = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${auth.token}`);

  assert.equal(me.status, 200);
  assert.equal(me.body.id, auth.user.id);
  assert.equal(me.body.role, "shop_owner");
});

test("owner can upload, analyze, confirm, search, and create a pickup request", async () => {
  const auth = await registerOwner();
  const shop = await createOwnerShop(auth.token);

  const upload = await request(app)
    .post("/api/uploads/product-image")
    .set("Authorization", `Bearer ${auth.token}`)
    .attach("image", tinyPng, { filename: "colgate-strong-teeth-rs95.png", contentType: "image/png" });

  assert.equal(upload.status, 201);
  assert.match(upload.body.imageUrl, /\/uploads\/product-/);
  assert.equal(upload.body.storage, "local");

  const analysis = await request(app).post("/api/onboarding/analyze").send({
    imageUrl: upload.body.imageUrl,
    manualHint: "Colgate Strong Teeth toothpaste",
    shopId: shop.id
  });

  assert.equal(analysis.status, 200);
  assert.equal(analysis.body.meta.provider, "local");
  assert.ok(analysis.body.suggestedKeywords.length > 0);

  const confirm = await request(app)
    .post("/api/onboarding/confirm")
    .set("Authorization", `Bearer ${auth.token}`)
    .send({
      onboardingSessionId: analysis.body.sessionId,
      name: analysis.body.extracted.name,
      brand: analysis.body.extracted.brand,
      category: analysis.body.extracted.category,
      mrp: analysis.body.extracted.mrp,
      price: analysis.body.extracted.price,
      quantity: 3,
      stockStatus: "in_stock",
      imageUrl: upload.body.imageUrl,
      keywords: analysis.body.suggestedKeywords
    });

  assert.equal(confirm.status, 201);
  assert.equal(confirm.body.catalogResolution.status, "linked_existing");

  const productId = confirm.body.product.id;
  const search = await request(app).get("/api/search/products").query({
    query: "colgate",
    lat: shop.latitude,
    lng: shop.longitude,
    radiusKm: 6,
    page: 1,
    pageSize: 5
  });

  assert.equal(search.status, 200);
  assert.ok(search.body.results.some((entry: { product: { id: string } }) => entry.product.id === productId));

  const pickup = await request(app).post("/api/pickup-intents").send({
    shopId: shop.id,
    productId,
    customerName: "Buyer One",
    customerPhone: "9000000001",
    quantityRequested: 1
  });

  assert.equal(pickup.status, 201);
  assert.equal(pickup.body.product.id, productId);
});

test("upload rejects unsupported file types", async () => {
  const auth = await registerOwner();
  await createOwnerShop(auth.token);

  const upload = await request(app)
    .post("/api/uploads/product-image")
    .set("Authorization", `Bearer ${auth.token}`)
    .attach("image", Buffer.from("not-an-image"), { filename: "notes.txt", contentType: "text/plain" });

  assert.equal(upload.status, 400);
  assert.equal(upload.body.message, "Only JPG, PNG, or WEBP images are allowed.");
});
