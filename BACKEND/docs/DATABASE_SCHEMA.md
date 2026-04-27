# UrbnBzr Database Schema

## Purpose

This doc locks the MVP data shape so routes, services, and Mongo collections stay aligned.

## Design rules

1. Keep shared catalog data separate from shop inventory.
2. Store shop location as GeoJSON for nearby search.
3. Keep AI onboarding traceable with session records.
4. Use append-only analytics events plus light summary counters.
5. Support pickup intent without building full order management.

## Collections

### `users`

Purpose: auth and identity.  
Fields: `_id role fullName email phone passwordHash isVerified status lastLoginAt createdAt updatedAt`  
Indexes: unique sparse `email`, unique sparse `phone`

### `shops`

Purpose: public shop profile and location.  
Fields: `_id ownerUserId name slug type phone contactName address location serviceRadiusKm metricsSummary status createdAt updatedAt`  
Indexes: unique `slug`, `ownerUserId`, `location` as `2dsphere`

### `catalog_products`

Purpose: central product master.  
Fields: `_id canonicalName normalizedName brand category unit defaultMrp keywords searchTokens imageHints aliases createdAt updatedAt`  
Indexes: `normalizedName`, `brand`, `category`

### `inventory_items`

Purpose: shop-specific stock records.  
Fields: `_id shopId catalogProductId displayName price mrp quantity stockStatus imageUrls source lastConfirmedAt createdAt updatedAt`  
Indexes: unique compound `shopId + catalogProductId`, `shopId`, `catalogProductId`

### `ai_onboarding_sessions`

Purpose: AI suggestions plus owner confirmation history.  
Fields: `_id shopId createdByUserId sourceImageUrl rawOcrText manualHint analysis status acceptedCatalogProductId ownerCorrections modelMeta createdAt updatedAt`  
Indexes: `shopId`, `status`, `acceptedCatalogProductId`

### `search_logs`

Purpose: demand tracking and search quality.  
Fields: `_id actorUserId query normalizedQuery location radiusKm resultCount selectedShopId selectedCatalogProductId searchAt`  
Indexes: `normalizedQuery`, `searchAt`

### `analytics_events`

Purpose: low-level interaction log.  
Fields: `_id eventType actorUserId shopId catalogProductId inventoryItemId sessionId metadata createdAt`  
Indexes: `eventType`, `shopId`, `catalogProductId`, `createdAt`

### `pickup_intents`

Purpose: lightweight reserve or inquiry request for pickup.  
Fields: `_id shopId catalogProductId inventoryItemId customerUserId customerName customerPhone quantityRequested note status createdAt updatedAt`  
Indexes: `shopId`, `status`, `createdAt`

## Relationships

- One `user` can own many `shops`
- One `shop` can have many `inventory_items`
- One `catalog_product` can appear in many `inventory_items`
- One `shop` can have many `ai_onboarding_sessions`
- One `shop` can receive many `pickup_intents`

## Validation rules

- Shop coordinates must be valid
- GeoJSON coordinates must be `[lng, lat]`
- Inventory requires both `shopId` and `catalogProductId`
- `quantity` cannot be negative
- `price` should usually be less than or equal to `mrp`
- Confirmed onboarding must end in a valid inventory item
- Guest search may create `search_logs` with no `actorUserId`

## MVP required collections

- `users`
- `shops`
- `catalog_products`
- `inventory_items`
- `ai_onboarding_sessions`
- `search_logs`
- `analytics_events`
- `pickup_intents`

## Summary fields

Keep these inside `shops.metricsSummary` for fast reads:
- `views`
- `clicks`
- `searchHits`
- `inventoryCount`
- `lastInventoryUpdateAt`
