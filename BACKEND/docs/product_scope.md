# UrbnBzr Product Scope

Scope baseline date: `2026-04-22`

## Goal

UrbnBzr helps people find products in nearby local shops and helps shop owners digitize inventory quickly with AI-assisted onboarding.

## MVP in one sentence

An owner adds products with AI help, a customer searches nearby inventory, and both sides can complete that loop without admin support.

## Main users

- Shop owners: kirana, stationery, pharmacy, and small general stores
- Customers: nearby people checking product availability before visiting
- Secondary users: students, office-goers, and small retailers moving online

## MVP core flow

1. Owner registers and creates a shop.
2. Owner uploads a product image.
3. AI suggests name, brand, category, and price hint.
4. Owner reviews and confirms.
5. Product is saved to shop inventory.
6. Customer searches nearby shops for that product.
7. Customer sees stock, price, and distance.

## In scope for MVP

- Owner auth
- One owner to one shop flow
- Shop profile setup
- Product onboarding from image upload
- AI-assisted prefill with manual correction
- Inventory create, update, and list
- Nearby product search by location and radius
- Shop detail and basic analytics
- Pickup intent or reserve-style request
- MongoDB persistence
- React frontend

## Out of scope for MVP

- Delivery logistics
- Online payments
- Real-time hardware stock sync
- Ratings and reviews
- Chat and customer support flows
- Loyalty, coupons, and subscriptions
- Multi-language support
- Full admin panel
- Dynamic pricing and forecasting

## AI scope for MVP

- Simple OCR or text extraction
- Product field extraction
- Catalog matching
- Confidence score
- Human confirmation before save

## Success criteria

- Owner can create an account and shop
- Owner can add inventory through AI-assisted onboarding
- Data survives restart in persistent mode
- Customer can search nearby inventory
- Search results show useful shop choices
- Pickup intent can be created for a listed item

## Post-MVP

- Better ranking and duplicate detection
- Customer login and saved history
- Notifications
- Better stock tracking
- Demand insights
- Redis caching
- Embeddings-based matching

## Production-ready means

- Strong auth and access control
- Logs, monitoring, and alerts
- Automated tests for key flows
- Backups and recovery
- CI/CD and environment separation
- Basic privacy and compliance review

## Locked decisions

- Discovery first, not delivery first
- Owner speed matters more than perfect AI accuracy
- AI never saves inventory without owner confirmation
- Guest customer search is allowed
- Inventory is manually maintained by owners in MVP
