# Distributed API Gateway & Rate Limiter

A full-stack API gateway that handles authentication, distributed rate limiting, and request routing — with a React dashboard for live testing and analytics. Built to demonstrate real distributed systems concepts: multiple rate limiting algorithms, Redis atomic operations for concurrency safety, and measured performance under load.

**Live demo:** [your deployed link here]

---

## Why this project

Most rate limiter tutorials stop at "wrap a counter around a route." This project goes further:
- Implements **three distinct rate limiting algorithms** (Fixed Window, Sliding Window Log, Token Bucket) as interchangeable, swappable modules
- Solves the **race condition problem** in distributed rate limiting using Redis atomic operations (`INCR` and Lua scripts via `EVAL`)
- Separates **two distinct authentication mechanisms** (JWT for dashboard sessions, API keys for programmatic gateway calls) — a common real-world pattern (see: Stripe, AWS)
- Includes **real load test numbers**, not just claims

---

## Architecture

Client (React)
↓
├── Dashboard/Login/Signup → JWT auth → MongoDB (users)
↓
└── Playground → Gateway (Express)
↓
verifyApiKey (MongoDB lookup)
↓
checkRateLimit (Redis, atomic)
↓
routeToService (forward request)
↓
logRequest (MongoDB, async)
↓
Dummy services (weather/quotes)


**Tech stack:**
- Backend: Node.js, Express, Mongoose, JWT, bcrypt
- Database: MongoDB Atlas (persistent — users, request logs)
- Cache/Rate limiting: Upstash Redis (ephemeral — counters, tokens)
- Frontend: React (Vite), React Router, Recharts, Axios
- Load testing: autocannon

---

## Rate limiting algorithms

| Algorithm | How it works | Trade-off |
|---|---|---|
| **Fixed Window Counter** | Increments a counter per time-bucket (e.g. per-minute), resets when the bucket changes | Simple, cheap (1 Redis key per user), but allows a "boundary burst" — up to 2x the limit if requests cluster right at a window edge |
| **Sliding Window Log** | Stores every request timestamp in a Redis sorted set, counts entries within a trailing time window | Most accurate, no boundary flaw, but more memory-intensive — stores one entry per request |
| **Token Bucket** | Each user has a bucket of tokens that refill gradually over time; each request spends one token | Allows controlled bursts while enforcing a steady average rate — closest to real-world traffic patterns (used by Stripe, AWS API Gateway) |

All three are implemented as interchangeable modules with the same interface (`isAllowed(apiKey) → boolean`) and can be switched live via the Playground dropdown, or via the `x-algorithm` header on any gateway request.

---

## The race condition (and how it's solved)

A naive rate limiter does three separate steps: **read** the current count, **check** if it's under the limit, **write** the incremented value back. If two requests arrive at nearly the same instant, both can read the same starting count before either writes back — letting more requests through than the limit allows.

**Fix:** Redis's `INCR` command performs read-increment-write as a single atomic operation — impossible to interrupt partway through. For Token Bucket, which needs multiple related values (token count, last refill time) updated together, a **Lua script** run via `EVAL` executes entirely inside Redis as one atomic unit, preventing any interleaving between simultaneous requests.

This was verified using the Playground's "Spam Test" feature, which fires 15–20 concurrent requests (`Promise.all`) — testing concurrent load, not just sequential requests.

---

## Load test results

Tested with `autocannon` — 10 concurrent connections, 10 second duration.

**Through the full gateway** (auth + rate limiting + logging):
- 50.9 requests/sec
- Avg latency: 181.61 ms | p99: 863 ms
- 504/509 requests correctly rate-limited (429), 5 allowed — confirms the limiter holds under load far exceeding the configured limit (5 req/min)

**Raw dummy service** (no auth, no rate limiting, no logging):
- 3,615.4 requests/sec
- Avg latency: 2.24 ms | p99: 14 ms

The ~70x throughput difference reflects the real cost of the gateway's work: an API key lookup (MongoDB), an atomic rate limit check (Redis), request forwarding, and audit logging (MongoDB) — three I/O operations per request versus zero.

Full results: [`server/LOADTEST_RESULTS.md`](./server/LOADTEST_RESULTS.md)

---

## Setup & running locally

### Prerequisites
- Node.js (v18+)
- A free MongoDB Atlas cluster
- A free Upstash Redis database

### Backend
```bash
cd server
npm install
```
Create `server/.env`:

PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=any_long_random_string
REDIS_URL=your_upstash_redis_tcp_url

```bash
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

Visit `http://localhost:5173`, sign up, and try the Playground.

---

## Project structure

server/
├── config/ # DB and Redis connection setup
├── models/ # Mongoose schemas (User, RequestLog)
├── controllers/ # Route logic
├── routes/ # URL → controller mapping
├── middleware/ # Auth, rate limiting, logging
├── rateLimiters/ # The three algorithm implementations
└── services/ # Dummy protected services

client/
├── src/pages/ # Login, Signup, Dashboard, Playground, Analytics
├── src/context/ # Auth state management
└── src/api/ # Axios instances


---

## What I'd improve next
- Move request logging off the critical response path (fire-and-forget instead of awaited) to reduce gateway latency
- Add a circuit breaker for backend service failures
- Support per-user configurable rate limits (currently a single global limit)