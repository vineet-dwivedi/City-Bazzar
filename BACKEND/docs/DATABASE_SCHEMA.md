# City Bazaar Database Schema

This document locks the persistent data model for the City Bazaar MVP and near-term upgrades.

## Step 3 objective

Define a MongoDB-ready schema for the entities we know we need, so later persistence work does not change the product shape.

## Design principles

1. Keep the central product catalog separate from per-shop inventory.
2. Store shop location as GeoJSON so nearby discovery is efficient.
3. Treat AI onboarding as a traceable workflow, not a one-time black box call.
4. Keep analytics events append-only and derive summaries from them when needed.
5. Design pickup intent now, even if the first release keeps it disabled.

## Collections

### `users`

Purpose: authentication, identity, and role management.

Core fields:
- `_id`
- `role`: `shop_owner | customer | admin`
- `fullName`
- `email`
- `phone`
- `passwordHash`
- `isVerified`
- `status`: `active | pending_verification | disabled`
- `lastLoginAt`
- `createdAt`
- `updatedAt`

Indexes:
- unique sparse `email`
- unique sparse `phone`
- `role`

### `shops`

Purpose: the public identity and location of a local store.

Core fields:
- `_id`
- `ownerUserId`
- `contactName`
- `name`
- `slug`
- `type`
- `phone`
- `address`
- `location`
- `serviceRadiusKm`
- `status`: `draft | active | suspended`
- `verificationStatus`: `unverified | pending | verified | rejected`
- `businessHours`
- `metricsSummary`
- `createdAt`
- `updatedAt`

Important note:
- `location` must be stored as GeoJSON `Point` with coordinates `[longitude, latitude]`

Indexes:
- unique `slug`
- `ownerUserId`
- `location` as `2dsphere`
- `type`
- `status`

### `catalog_products`

Purpose: the shared product master used across all shops.

Core fields:
- `_id`
- `canonicalName`
- `normalizedName`
- `brand`
- `category`
- `unit`
- `defaultMrp`
- `keywords`
- `searchTokens`
- `imageHints`
- `aliases`
- `createdByUserId`
- `createdAt`
- `updatedAt`

Indexes:
- `normalizedName`
- `brand`
- `category`
- text or token index on `canonicalName`, `brand`, `keywords`, `aliases`

### `inventory_items`

Purpose: a shop-specific record of what is actually available.

Core fields:
- `_id`
- `shopId`
- `catalogProductId`
- `displayName`
- `price`
- `mrp`
- `quantity`
- `stockStatus`
- `imageUrls`
- `source`: `manual | ai_assisted`
- `lastConfirmedAt`
- `updatedByUserId`
- `createdAt`
- `updatedAt`

Indexes:
- unique compound `shopId + catalogProductId`
- `shopId`
- `catalogProductId`
- `stockStatus`

### `ai_onboarding_sessions`

Purpose: trace AI extraction, catalog matching, owner corrections, and confidence for each product upload.

Core fields:
- `_id`
- `shopId`
- `createdByUserId`
- `sourceImageUrl`
- `rawOcrText`
- `manualHint`
- `analysis`
- `status`: `analyzed | confirmed | rejected`
- `acceptedCatalogProductId`
- `ownerCorrections`
- `modelMeta`
- `createdAt`
- `updatedAt`

Why this exists:
- lets us measure AI accuracy
- lets us compare suggested vs final values
- gives us training and evaluation data later

Indexes:
- `shopId`
- `createdByUserId`
- `status`
- `acceptedCatalogProductId`

### `search_logs`

Purpose: capture customer demand and search quality.

Core fields:
- `_id`
- `actorUserId`
- `query`
- `normalizedQuery`
- `location`
- `radiusKm`
- `resultCount`
- `selectedShopId`
- `selectedCatalogProductId`
- `searchAt`

Indexes:
- `normalizedQuery`
- `actorUserId`
- `searchAt`

### `analytics_events`

Purpose: track low-level product and shop interactions.

Core fields:
- `_id`
- `eventType`
- `actorUserId`
- `shopId`
- `catalogProductId`
- `inventoryItemId`
- `sessionId`
- `metadata`
- `createdAt`

Example event types:
- `view`
- `click`
- `search`
- `shop_open`
- `inventory_added`
- `pickup_intent`

Indexes:
- `eventType`
- `shopId`
- `catalogProductId`
- `createdAt`

### `pickup_intents`

Purpose: a lightweight customer request to reserve or inquire about an item for pickup.

This is schema-locked now, even if the feature is enabled after the first MVP release.

Core fields:
- `_id`
- `shopId`
- `catalogProductId`
- `inventoryItemId`
- `customerUserId`
- `customerName`
- `customerPhone`
- `quantityRequested`
- `note`
- `status`: `requested | acknowledged | ready_for_pickup | completed | cancelled`
- `createdAt`
- `updatedAt`

Indexes:
- `shopId`
- `customerUserId`
- `status`
- `createdAt`

## Relationship map

- one `user` can own many `shops`
- one `shop` can have many `inventory_items`
- one `catalog_product` can appear in many `inventory_items`
- one `shop` can have many `ai_onboarding_sessions`
- one `user` can create many `search_logs`
- one `shop` can receive many `pickup_intents`
- one `catalog_product` can be referenced by many `pickup_intents`

## Embedded vs referenced decisions

### Referenced

- `shops.ownerUserId -> users._id`
- `inventory_items.shopId -> shops._id`
- `inventory_items.catalogProductId -> catalog_products._id`
- `ai_onboarding_sessions.acceptedCatalogProductId -> catalog_products._id`
- `pickup_intents.shopId -> shops._id`

### Embedded

- `shops.metricsSummary`
- `shops.businessHours`
- `catalog_products.aliases`
- `inventory_items.imageUrls`
- `ai_onboarding_sessions.analysis`
- `analytics_events.metadata`

## MVP-required collections

These should exist before we call the product persistent and usable:

- `users`
- `shops`
- `catalog_products`
- `inventory_items`
- `ai_onboarding_sessions`
- `search_logs`
- `analytics_events`

## Near-term but not day-one required

- `pickup_intents`

## Validation rules to lock now

- shop coordinates must be valid latitude and longitude
- shop `location.coordinates` must be stored as `[lng, lat]`
- inventory cannot exist without both `shopId` and `catalogProductId`
- AI-confirmed onboarding must always end in a valid inventory record
- `price` should not exceed `mrp` unless explicitly overridden
- `quantity` cannot be negative
- customer guest search can create `search_logs` with no `actorUserId`

## Summary fields to maintain

These can be embedded for read performance and recalculated later if needed:

### `shops.metricsSummary`

- `views`
- `clicks`
- `searchHits`
- `inventoryCount`
- `lastInventoryUpdateAt`

## Migration notes from current in-memory MVP

Current code already maps well to:

- `shops`
- `catalog_products`
- `inventory_items`
- a lightweight form of `shops.metricsSummary`

Still missing in code:

- `users`
- `ai_onboarding_sessions`
- `search_logs`
- `analytics_events`
- `pickup_intents`

## What Step 3 means for engineering

From this point onward:

1. New backend code should align with these collection names and relations.
2. MongoDB work should preserve the split between catalog and inventory.
3. Auth should be built on `users`, not on shop records.
4. AI onboarding should write a session record before or along with final inventory save.
