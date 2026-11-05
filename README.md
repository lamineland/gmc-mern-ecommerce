# MERN E-Commerce

React (TypeScript, Vite) + Express (TypeScript) + MongoDB (Mongoose).

## Setup
1. Start a local MongoDB on `mongodb://127.0.0.1:27017` (e.g. `brew tap mongodb/brew && brew install mongodb-community && brew services start mongodb-community`, or Docker: `docker run -d -p 27017:27017 --name mongo mongo:7`).
2. `npm run install:all`
3. `server/.env` already exists (copy of `.env.example`); adjust `MONGODB_URI` if needed.
4. `npm run seed` — loads 16 products and two users: `admin@example.com / admin123`, `user@example.com / user123`.
5. `npm run dev` — API on :5001, web on http://localhost:5173 (Vite proxies `/api`).

## API
| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `login`, `logout`, `forgot-password`, `reset-password/:token`; `GET /api/auth/me` |
| Products | `GET /api/products?search&category&minPrice&maxPrice&sort&page&limit`, `GET /categories`, `GET /:id`; admin: `POST`, `PUT /:id`, `DELETE /:id` |
| Cart (auth) | `GET /api/cart`, `POST /items`, `PUT /items/:productId`, `DELETE /items/:productId`, `DELETE /` |
| Orders (auth) | `POST /api/orders` (checkout), `GET /mine`, `GET /:id`; admin: `GET /`, `PUT /:id/status` |

## Notes
- Payment goes through `server/src/utils/payment.ts`, a simulated gateway (card ending `0000` is declined). Swap in Stripe/PayPal there.
- Password reset has no email service: in non-production the reset link is returned by the API and shown on the page.
- Admin product management is API-only (no admin UI yet).
