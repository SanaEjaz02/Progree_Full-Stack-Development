# SE Commerce Engine

A boutique lifestyle storefront built with React, Express, MongoDB, and Stripe test mode.

## Requirements

- Node.js 20 or later and npm
- MongoDB running locally, or a MongoDB Atlas connection string
- Stripe sandbox keys for checkout (added only to the local `.env` file)

## Setup

1. From this folder, install all workspaces:

   ```sh
   npm install
   ```

2. Create your local environment file from the safe template:

   ```powershell
   Copy-Item .env.example .env
   ```

   Set `MONGODB_URI` to your MongoDB connection string and replace `JWT_SECRET` with a random secret of at least 32 characters. Add Stripe test keys to `.env` when requested during payment setup. Never commit `.env`.

3. Seed the MongoDB catalog:

   ```sh
   npm run seed --workspace server
   ```

4. Start MongoDB, then run the client and API together:

   ```sh
   npm run dev
   ```

   The storefront runs at `http://localhost:5173`; the API runs at `http://localhost:4000`.

For separate terminals, run these exact commands from this folder:

   ```sh
   npm run start --workspace server
   ```

   ```sh
   npm run dev:client
   ```

## Commands

- `npm run dev`: start client and API together
- `npm run dev:client`: start only the client
- `npm run dev:server`: start only the API
- `npm run seed --workspace server`: idempotently seed ten Serein leather goods
- `npm test`: run server and client tests
- `npm run build`: build the client for production

## Project layout

- `client/`: React storefront
- `server/src/routes/`: API routes
- `server/src/controllers/`: request handlers
- `server/src/models/`: Mongoose schemas
- `server/src/middleware/`: API security and error handling
- `server/test/`: API tests

## Stripe sandbox

The checkout uses Stripe Elements in test mode. Set `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` in the ignored `.env` file. The server exposes only the publishable key to the browser; the secret remains server-side.

Test cards:

- Success: `4242 4242 4242 4242`
- Generic decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

Use any future expiry date, any three-digit CVC, and any valid postal code.

## API surface

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/products`, `GET /api/products/:slug`
- `GET /api/cart`, `POST/PATCH/DELETE /api/cart/:productId`
- `GET /api/checkout/config`, `POST /api/checkout/payment-intent`, `POST /api/checkout/confirm`
- `GET /api/orders`

See `REPORT.md` for the architecture, security decisions, payment flow, and verification notes.