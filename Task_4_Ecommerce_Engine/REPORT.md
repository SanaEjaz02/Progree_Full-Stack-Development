# Task 4: Serein Maison E-Commerce Engine

## Executive Summary

Serein Maison is a premium boutique storefront for curated leather goods. The project demonstrates secure account authentication, a MongoDB-backed catalog, persistent carts, Stripe sandbox checkout, stock-safe order creation, and responsive React presentation.

## Architecture

The application is split into two npm workspaces:

- `client/`: React 19, Vite, React Router, Framer Motion, Lucide, and Stripe Elements.
- `server/`: Express 5 API with Mongoose models for users, products, carts, and orders.
- `server/src/controllers/`: validation and business operations.
- `server/src/routes/`: resource boundaries for auth, products, carts, checkout, and orders.
- `server/src/scripts/seedCatalog.js`: idempotent ten-product catalog seed.

The browser talks to the Express API over JSON. Product prices, stock, cart totals, and payment amounts are recalculated on the server. MongoDB is configured through `MONGODB_URI`, allowing either a local instance or MongoDB Atlas.

## Security Decisions

- Passwords are hashed with `bcryptjs` using a work factor of 12. Plaintext passwords are never persisted.
- JWTs are signed with `JWT_SECRET`, include a seven-day expiry and issuer, and are checked against the current user on protected routes.
- Registration validates email format and enforces a 10-character password with upper/lowercase letters, a number, and a symbol.
- Helmet, CORS allowlisting, JSON size limits, API rate limiting, and auth-specific rate limiting are enabled.
- Error responses expose safe messages only; unexpected server errors are logged server-side.
- Stripe secret keys remain server-only. The client receives only the publishable key from `/api/checkout/config`.
- Checkout never trusts client totals. The server loads the user's cart, checks current stock, creates the PaymentIntent amount, verifies the succeeded PaymentIntent, decrements stock, creates the order, and clears the cart.

## Payment Flow

1. An authenticated user opens checkout.
2. The server calculates the current cart subtotal and creates a Stripe PaymentIntent in test mode.
3. Stripe Elements collects sandbox payment details in the browser.
4. The client confirms the PaymentIntent with `redirect: if_required`.
5. The server retrieves the PaymentIntent and accepts only `succeeded` status.
6. The server verifies the authenticated owner and amount against the current cart, decrements stock, creates an order with a payment-intent id, and clears the cart in a Mongo transaction.
7. The confirmation view receives the created order and the order history endpoint persists it for future sessions.

## Test Cards

Use Stripe's official test cards while the account is in test mode:

- Successful payment: `4242 4242 4242 4242`
- Generic decline: `4000 0000 0000 0002`
- 3D Secure authentication: `4000 0025 0000 3155`

Use any future expiry date, any three-digit CVC, and any valid postal code.

## Verification

The automated suite passes **8 tests** across API and client:

- API health and safe unknown-route behavior.
- Registration password hashing and weak-password rejection.
- Cart subtotal and quantity representation.
- PaymentIntent amount calculation from database product prices.
- React client rendering.

The live journey was completed against MongoDB Atlas and Stripe test mode: a fresh account registered, browsed the ten-item catalog, added two products (three total units), changed quantity, paid with Stripe's `4242` test card, reached confirmation, and found the paid order in history after sign-out and sign-in. Stripe returned `succeeded` for USD 1,590.00. Atlas recorded one paid order, an empty cart, and inventory decrements of two shoulder bags and one tote. A viewport sweep at 375px, 768px, and 1440px across shop, product detail, account, bag, active checkout/payment form, confirmation, and order history found no horizontal overflow. Checkout waits for authenticated cart hydration and initializes Stripe Elements once under React StrictMode.

## Environment

Copy `.env.example` to `.env` and set the local values. `.env` is ignored by Git. Never paste secrets into committed files, screenshots, reports, or browser-visible code.

## Design Direction

The storefront uses an ivory paper ground, deep forest green, oxidized brass, and restrained rust accents. Cormorant Garamond provides the editorial voice; DM Sans keeps forms, navigation, pricing, and operational states legible. Product imagery, generous spacing, restrained motion, skeleton loaders, empty states, and mobile-specific navigation support a polished walkthrough at 375px, 768px, and 1440px.
