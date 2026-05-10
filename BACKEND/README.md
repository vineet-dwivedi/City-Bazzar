# UrbnBzr Backend

Node.js + TypeScript backend for the UrbnBzr hyperlocal discovery platform.

## Planning docs

- [Product scope](./docs/product_scope.md)
- [MVP user flows](./docs/user_flow.md)
- [Database schema](./docs/DATABASE_SCHEMA.md)

## What this includes

- User registration, login, and current-user auth endpoints
- Owner-linked shop registration and profile storage
- Owner-protected shop and inventory management routes
- Seeded catalog, shops, and shop inventory
- Location-based product discovery across nearby shops
- AI-assisted product onboarding flow with auto-fill suggestions
- Pickup intent flow for reserve-and-pickup requests
- Basic shop analytics counters for views, clicks, and search hits

## MVP assumptions

- Data can run in `memory` or `mongo` mode
- Product onboarding can run with local fallback, free `Tesseract` OCR, or `Gemini` vision extraction
- Image storage can stay local or switch to `Cloudinary`
- Orders, payments, delivery logistics, and hardware sync are intentionally out of scope

## Run locally

```bash
npm install
npm run dev
```

Server runs on `http://localhost:4000` by default.

If your environment skips dev dependencies, run `npm install --include=dev` before `npm run dev`.
Create a local `.env` from `.env.example` when you want to switch to Mongo mode or change defaults.

## Tests

```bash
npm test
```

The test suite covers auth, upload, onboarding, search, pickup, and readiness.

## Storage modes

- `FILE_STORAGE_PROVIDER=local` keeps uploaded files on disk under `UPLOAD_DIR`
- `FILE_STORAGE_PROVIDER=cloudinary` uploads images to Cloudinary and returns hosted URLs

Cloudinary mode requires:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Storage modes

- `DATA_STORE_MODE=memory` keeps the current seeded demo behavior
- `DATA_STORE_MODE=mongo` enables MongoDB persistence through `MONGODB_URI`
- `MONGODB_SEED_ON_START=true` seeds the demo catalog and shops into an empty database

## API summary

### Health

- `GET /api/health`
- `GET /api/health/ready`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Owner

- `POST /api/owner/shop`
- `GET /api/owner/shop`
- `PATCH /api/owner/shop`
- `GET /api/owner/analytics`
- `GET /api/owner/inventory`
- `POST /api/owner/inventory`
- `PATCH /api/owner/inventory/:productId`
- `DELETE /api/owner/inventory/:productId`
- `GET /api/owner/pickup-intents`
- `PATCH /api/owner/pickup-intents/:intentId`

### Shops

- `GET /api/shops`
- `GET /api/shops/:shopId`
- `GET /api/shops/:shopId/analytics`
- `POST /api/shops/:shopId/events`

### Pickup intents

- `POST /api/pickup-intents`

### Discovery

- `GET /api/catalog`
- `GET /api/catalog/:productId`
- `GET /api/search/products?query=toothpaste&lat=28.6139&lng=77.2090&radiusKm=5`
- `GET /api/catalog/search?query=maggi`

### AI onboarding

- `POST /api/onboarding/analyze`
- `POST /api/onboarding/confirm`

Set one of these modes:
- `AI_PROVIDER=local` for zero-cost heuristic extraction
- `AI_PROVIDER=tesseract` for free OCR-based extraction
- `AI_PROVIDER=gemini` plus `GEMINI_API_KEY` for vision extraction

If the selected provider fails, the backend falls back to the local extractor.

## Suggested frontend flow

1. Shop owner creates an account and a shop profile.
2. Frontend calls `POST /api/onboarding/analyze`.
3. Owner reviews and edits the prefilled fields.
4. Frontend calls authenticated `POST /api/onboarding/confirm`.
5. Customer searches nearby products and can create `POST /api/pickup-intents`.

## Next upgrades

- Move uploads from local disk to cloud storage
- Add frontend flow tests
- Add monitoring and error tracking

## Docker

```bash
docker compose up --build
```

This starts:
- `mongo` on `27017`
- backend on `4000`

Before real deployment, change `JWT_SECRET` and tighten `CORS_ORIGINS`.
