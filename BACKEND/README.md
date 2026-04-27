# City Bazaar Backend MVP

Node.js + TypeScript backend scaffold for the City Bazaar hyperlocal discovery platform.

## Planning docs

- [Product scope](./docs/PRODUCT_SCOPE.md)
- [MVP user flows](./docs/MVP_USER_FLOWS.md)
- [Database schema](./docs/DATABASE_SCHEMA.md)

## What this includes

- User registration, login, and current-user auth endpoints
- Shop registration and profile storage
- Owner-protected shop and inventory management routes
- Seeded catalog, shops, and shop inventory
- Location-based product discovery across nearby shops
- AI-assisted product onboarding flow with auto-fill suggestions
- Basic shop analytics counters for views, clicks, and search hits

## MVP assumptions

- Data is stored in memory for now so frontend and API flows can be tested quickly
- Product onboarding simulates OCR/classification by using uploaded metadata (`imageUrl`, `rawText`, `manualHint`)
- Orders, payments, delivery logistics, and hardware sync are intentionally out of scope

## Run locally

```bash
npm install
npm run dev
```

Server runs on `http://localhost:4000` by default.

If your environment skips dev dependencies, run `npm install --include=dev` before `npm run dev`.
Create a local `.env` from `.env.example` when you want to switch to Mongo mode or change defaults.

### Storage modes

- `DATA_STORE_MODE=memory` keeps the current seeded demo behavior
- `DATA_STORE_MODE=mongo` enables MongoDB persistence through `MONGODB_URI`
- `MONGODB_SEED_ON_START=true` seeds the demo catalog and shops into an empty database

## API summary

### Health

- `GET /api/health`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Owner

- `POST /api/owner/shop`
- `GET /api/owner/shop`
- `PATCH /api/owner/shop`
- `GET /api/owner/inventory`
- `POST /api/owner/inventory`
- `PATCH /api/owner/inventory/:productId`
- `DELETE /api/owner/inventory/:productId`

### Shops

- `POST /api/shops/register`
- `GET /api/shops`
- `GET /api/shops/:shopId`
- `GET /api/shops/:shopId/analytics`
- `POST /api/shops/:shopId/events`
- `POST /api/shops/:shopId/inventory`

### Discovery

- `GET /api/search/products?query=toothpaste&lat=28.6139&lng=77.2090&radiusKm=5`
- `GET /api/catalog/search?query=maggi`

### AI onboarding

- `POST /api/onboarding/analyze`
- `POST /api/onboarding/confirm`

## Suggested frontend flow

1. Shop owner uploads an image and optional detected text.
2. Frontend calls `POST /api/onboarding/analyze`.
3. Owner reviews and edits the prefilled fields.
4. Frontend calls `POST /api/onboarding/confirm`.
5. Newly linked or created catalog product is added to shop inventory.

## Next upgrades

- Connect real OCR and image classification services
- Add Redis caching for hot search queries
- Introduce stock updates, order intents, and demand analytics
