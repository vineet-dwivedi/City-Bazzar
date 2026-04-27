# City Bazaar Product Scope

Scope baseline date: `2026-04-22`

This document locks the product boundaries for the first build so we can make engineering decisions without scope drift.

## Product goal

City Bazaar helps nearby users discover product availability from local shops and helps shop owners digitize inventory quickly with AI-assisted onboarding.

## Release definition

We will work in three layers:

1. `MVP`: demoable, usable by early pilot shops, limited but complete core flow.
2. `Post-MVP`: stronger usability, better data quality, better retention.
3. `Production-ready`: security, reliability, observability, and operational maturity for wider rollout.

## Target users

### Primary users

- Local shop owners: kirana, stationery, pharmacy, and small general stores
- Nearby customers searching for products before visiting a shop

### Secondary users

- Students and urban users who value convenience
- Small retailers starting digital adoption

## MVP objective

Deliver one complete loop:

1. A shop owner registers.
2. The shop owner uploads a product image.
3. AI suggests product details.
4. The owner confirms and saves the product.
5. A nearby customer searches for the product.
6. The customer sees which nearby shop has it.

If this loop works reliably, the MVP is successful.

## In Scope For MVP

### Shop owner module

- Shop registration and basic profile setup
- Login for shop owners
- Product onboarding from image upload
- AI-assisted prefill for name, brand, category, and price hint
- Manual edit and confirmation before saving
- Inventory create, update, and view
- Basic shop dashboard with:
  - total listed products
  - views
  - clicks
  - search hits

### Customer module

- Guest access for product search
- Location-based discovery using coordinates and radius
- Product search across nearby shops
- Shop-level result cards with:
  - product availability
  - distance
  - price
  - stock status

### AI scope in MVP

- OCR from uploaded packaging image
- Structured extraction for:
  - product name
  - brand
  - category
  - MRP or visible price
- Catalog matching against existing products
- Confidence score plus editable prefill
- Human confirmation required before save

### Platform scope in MVP

- Node.js + TypeScript backend
- React frontend
- MongoDB persistence
- Image storage for uploaded product images
- Basic analytics events
- Admin-free onboarding flow for pilot launch

## Explicitly Out Of Scope For MVP

- Delivery logistics
- Online payments
- Real-time hardware inventory sync
- Full order management lifecycle
- Ratings and reviews
- Customer chat
- Loyalty programs
- Shop recommendations feed
- Dynamic pricing suggestions
- Multi-language support
- Full admin panel
- Advanced role hierarchy for staff

## Post-MVP Scope

These features are important, but they should not block the first release:

- Pickup request or order intent flow
- Ratings and reviews
- Better search ranking
- Product popularity and demand insights
- Duplicate catalog moderation
- Better inventory stock tracking
- Customer login, favorites, and recent searches
- Notification system for shop owners
- Redis caching for hot search queries
- Embeddings-based catalog matching

## Production-Ready Scope

These are required before a larger city rollout:

- Secure authentication and session/token handling
- Proper access control
- Persistent database and media storage
- Audit logging for product changes
- Rate limiting and abuse protection
- Error monitoring and alerting
- Automated tests for critical flows
- Backup and recovery plan
- CI/CD pipeline
- Environment separation for dev, staging, and production
- Privacy policy and basic legal/compliance review

## MVP user flows to lock

### Shop owner flow

1. Register account and shop
2. Add or verify shop location
3. Upload product image
4. Review AI suggestion
5. Edit if needed
6. Save inventory item
7. View listed products and basic analytics

### Customer flow

1. Allow location or enter coordinates
2. Search for a product
3. View nearby matching shops
4. Compare distance, price, and stock
5. Decide where to visit or place a pickup request later

## MVP success criteria

The MVP can be called complete when all of these are true:

- Shop owners can register and log in
- Shops can add products with AI-assisted onboarding
- Product data is saved persistently
- Customers can search nearby inventory successfully
- Search returns meaningful shop results with distance and stock status
- Core APIs and frontend flow work end to end
- Pilot data survives restart and redeploy

## Product decisions locked in this phase

- `Pickup/discovery first`, not delivery-first
- `Shop-owner adoption speed` is more important than perfect AI accuracy
- `Human confirmation` is mandatory before AI-suggested data is saved
- `Customer search` can be guest-first in MVP
- `Inventory truth` is manually maintained by shop owners in MVP

## Open questions for later, not blockers now

- Should customers be able to reserve an item in MVP or only discover it?
- How often should shop owners be nudged to refresh stock?
- Will pharmacies require extra compliance rules before rollout?
- Do we support one shop per owner first, or multiple shops per owner?

## What Step 1 means for engineering

From this point onward, the build priority is:

1. Complete the MVP only
2. Avoid post-MVP features unless they unblock the MVP
3. Build the owner flow and customer search flow before optimization work 