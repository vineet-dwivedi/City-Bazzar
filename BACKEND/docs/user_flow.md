# UrbnBzr MVP User Flows

## Purpose

This doc defines the smallest complete journeys the MVP must support.

## Flow 1: Shop owner

### Goal

An owner should be able to create a shop, add a product with AI help, and see it in inventory.

### Steps

1. Register with phone or email and password.
2. Create shop profile with name, type, address, location, and radius.
3. Open the owner dashboard.
4. Upload a product image.
5. Review AI-filled fields.
6. Edit if needed.
7. Confirm and save.
8. See the product in inventory and analytics update.

### Required screens

- Owner auth
- Shop setup
- Owner dashboard
- Add product
- AI review and confirm
- Inventory list

### Required APIs

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/owner/shop`
- `GET /api/owner/shop`
- `GET /api/owner/analytics`
- `POST /api/onboarding/analyze`
- `POST /api/onboarding/confirm`
- `GET /api/owner/inventory`
- `POST /api/owner/inventory`
- `PATCH /api/owner/inventory/:productId`

### Acceptance

- Owner finishes the flow without admin help
- AI suggestions are editable
- Inventory persists in persistent mode
- Saved product appears immediately in inventory

## Flow 2: Customer

### Goal

A customer should be able to search for a product, compare nearby shops, and optionally create a pickup request.

### Steps

1. Open the app.
2. Share location or enter coordinates.
3. Search for a product like `toothpaste`.
4. See matching products and nearby shops.
5. Compare stock, price, and distance.
6. Open shop detail if needed.
7. Create a pickup intent for a listed item.

### Required screens

- Customer search
- Search results
- Shop detail

### Required APIs

- `GET /api/search/products`
- `GET /api/shops`
- `GET /api/shops/:shopId`
- `GET /api/catalog`
- `POST /api/shops/:shopId/events`
- `POST /api/pickup-intents`

### Acceptance

- Search works without customer auth
- Results are relevant and easy to compare
- Customer can identify a shop quickly
- Pickup intent is tied to a real shop product

## MVP screen list

1. Owner auth
2. Shop setup
3. Owner dashboard
4. Add product
5. AI review and confirm
6. Inventory list
7. Customer search
8. Search results
9. Shop detail

## Notes for engineering

- Owner writes stay under `/api/owner`
- Public shop routes are read-focused
- Onboarding confirm requires owner auth
- Search and pickup intent are the only customer-side MVP actions
- Any new feature that does not strengthen these two flows is post-MVP
