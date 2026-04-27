# City Bazaar MVP User Flows

This document translates the product scope into exact user journeys, frontend screens, and API requirements for the MVP.

## Step 2 objective

Lock the smallest complete journeys that make City Bazaar usable for:

1. A shop owner who wants to digitize inventory quickly
2. A customer who wants to know which nearby shop has a product

## Flow 1: Shop Owner Journey

### Goal

A shop owner should be able to register, create a shop profile, upload a product image, confirm AI-filled product details, and save inventory successfully.

### Steps

1. Owner opens the app and chooses `Register as shop owner`
2. Owner creates account with phone or email and password
3. Owner creates shop profile with:
   - shop name
   - shop type
   - address
   - location coordinates
   - service radius
4. Owner lands on the shop dashboard
5. Owner taps `Add product`
6. Owner uploads a product image
7. App sends the image to AI onboarding analysis
8. App shows editable fields:
   - product name
   - brand
   - category
   - MRP
   - price
   - stock quantity
9. Owner reviews and edits any wrong AI output
10. Owner confirms and saves
11. Product is added to shop inventory
12. Dashboard updates product count and analytics summary

### Required screens

- `Owner auth screen`
- `Shop setup screen`
- `Owner dashboard`
- `Add product screen`
- `AI review and confirm screen`
- `Inventory list screen`

### Required backend actions

- Create owner account
- Authenticate owner
- Create shop profile
- Upload product image
- Run AI analysis
- Confirm product details
- Save inventory item
- Fetch shop dashboard and analytics

### MVP acceptance criteria

- Owner can complete the full flow without admin help
- AI suggestions are editable before saving
- Inventory persists after restart
- Owner can see the newly added product in inventory

## Flow 2: Customer Journey

### Goal

A customer should be able to search for a product and see nearby shops that have it.

### Steps

1. Customer opens the app
2. Customer allows location access or enters a location manually
3. Customer types a product search like `toothpaste`
4. App fetches nearby matching products and shops
5. Customer sees result cards with:
   - product name
   - shop name
   - distance
   - price
   - stock status
6. Customer opens a shop detail view if needed
7. Customer decides which shop to visit

### Required screens

- `Customer search screen`
- `Search results screen`
- `Shop detail screen`

### Required backend actions

- Accept location and radius input
- Search products across nearby shops
- Return grouped product results with nearby shops
- Fetch shop details
- Record view and click analytics

### MVP acceptance criteria

- Customer can search without creating an account
- Search results are relevant to the query
- Results clearly show nearby options
- Customer can identify at least one shop choice quickly

## Screen Map

The MVP frontend should contain these core screens only:

1. `Owner auth`
2. `Shop setup`
3. `Owner dashboard`
4. `Add product`
5. `AI review and confirm`
6. `Inventory list`
7. `Customer search`
8. `Search results`
9. `Shop detail`

Anything beyond these should be treated as post-MVP unless it unblocks the core journeys.

## API Map

| Screen / Action | API | Status |
| --- | --- | --- |
| Owner register | `POST /api/auth/register` | Planned |
| Owner login | `POST /api/auth/login` | Planned |
| Shop setup | `POST /api/shops/register` | Exists |
| Fetch owner shop | `GET /api/shops/:shopId` | Exists |
| Fetch shop analytics | `GET /api/shops/:shopId/analytics` | Exists |
| Add product image for AI | `POST /api/onboarding/analyze` | Exists |
| Confirm AI result and save inventory | `POST /api/onboarding/confirm` | Exists |
| Manual inventory update | `POST /api/shops/:shopId/inventory` | Exists |
| Customer product search | `GET /api/search/products` | Exists |
| Customer opens shop detail | `GET /api/shops/:shopId` | Exists |
| Record product/shop click | `POST /api/shops/:shopId/events` | Exists |

## Data collected in the MVP flows

### Shop owner flow

- owner identity
- shop profile
- product images
- AI suggestions
- confirmed product metadata
- inventory quantity

### Customer flow

- search query
- location or coordinates
- search result click
- shop view

## Non-blocking improvements for later

These are useful but should not interrupt Flow 1 or Flow 2:

- customer account creation
- pickup request
- saved shops
- favorites
- review system
- notifications
- advanced ranking

## What Step 2 means for engineering

From this point onward:

1. Backend work should support these exact journeys
2. Frontend should be built around these exact screens
3. AI work should focus only on the product onboarding step in the owner journey
4. Any feature that does not strengthen Flow 1 or Flow 2 should be postponed