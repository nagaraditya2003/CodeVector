# CodeVector — Keyset Pagination Demo

A full-stack demo that shows why **keyset (cursor-based) pagination** beats traditional `OFFSET` pagination at scale.

The backend serves 200,000 product records from PostgreSQL. The frontend lets you browse them, filter by category, and run a live benchmark that proves the speed difference. Every cursor is HMAC-signed so clients can't tamper with it.

---

## Why This Exists

Most tutorials paginate with `LIMIT … OFFSET`. That works for small tables, but it falls apart once you hit tens of thousands of rows because the database still has to scan and throw away every skipped row.

Keyset pagination avoids that entirely. Instead of saying "skip the first 50,000 rows", it says "give me rows older than the last one I saw." The database jumps straight to the right spot using an index. Query time stays constant no matter how deep you page.

This project is a working proof of that idea — not a toy example, but a full app you can run, benchmark, and break.

---

## What's Inside

```
CodeVector/
├── Backend/             Express + PostgreSQL API
│   ├── src/
│   │   ├── index.js     Server entry point (Express, CORS, routes)
│   │   ├── db.js        PostgreSQL connection pool (Neon, SSL)
│   │   └── routes/
│   │       └── products.js   All product endpoints (list, benchmark)
│   └── scripts/
│       ├── migrate.js         Creates the products table and indexes
│       ├── seed.js            Generates 200,000 random products
│       └── concurrency-test.js  Proves pagination stays stable during concurrent writes
│
└── Frontend/            React + Vite SPA
    └── src/
        ├── App.jsx              Router and layout
        ├── pages/
        │   ├── Dashboard.jsx        Landing page with feature cards
        │   ├── Catalog.jsx          Paginated product browser
        │   ├── BenchmarkCenter.jsx  Live offset-vs-keyset speed test
        │   └── InteractiveGuide.jsx Explains how keyset pagination works
        └── components/
            ├── Navbar.jsx       Top navigation bar
            ├── Filters.jsx      Category filter dropdown
            └── ProductCard.jsx  Single product display card
```

---

## Prerequisites

You need these installed before you start:

- **Node.js** v18 or later
- **npm** (comes with Node)
- **PostgreSQL** — either a local instance or a hosted one like [Neon](https://neon.tech)

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/CodeVector.git
cd CodeVector
```

### 2. Set up the backend

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend/` folder with your own values:

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
HMAC_SECRET=replace-with-a-random-64-char-hex-string
PORT=3000
```

> **Generating an HMAC secret:** Run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and paste the output.

### 3. Create the table and indexes

```bash
npm run migrate
```

This creates the `products` table and two indexes:
- `idx_products_cursor` on `(created_at DESC, id DESC)` — powers keyset pagination.
- `idx_products_category_cursor` on `(category, created_at DESC, id DESC)` — speeds up filtered queries.

### 4. Seed the database

```bash
npm run seed
```

Inserts 200,000 products in batches of 1,000. Takes roughly 30–60 seconds depending on your database's network latency. You'll see a progress counter in the terminal.

### 5. Start the API server

```bash
npm run dev
```

The server starts on `http://localhost:3000`. You can verify it's running:

```bash
curl http://localhost:3000/health
# → {"status":"ok"}
```

### 6. Set up the frontend

Open a second terminal:

```bash
cd Frontend
npm install
npm run dev
```

Vite starts on `http://localhost:5173`. Open it in your browser.

---

## API Reference

### `GET /api/products`

Returns a paginated list of products sorted by newest first.

| Query Param | Type   | Default | Description                              |
|-------------|--------|---------|------------------------------------------|
| `limit`     | number | 20      | Items per page (1–100)                   |
| `category`  | string | —       | Filter by exact category name            |
| `cursor`    | string | —       | Cursor token from a previous response    |

**Response:**

```json
{
  "data": [
    {
      "id": 199847,
      "name": "Premium Gadget 199847",
      "category": "Electronics",
      "price": "42.99",
      "created_at": "2024-11-03T14:22:01.000Z",
      "updated_at": "2024-12-15T09:10:33.000Z"
    }
  ],
  "next_cursor": "eyJpZCI6MTk5ODI4LC...",
  "count": 20
}
```

To get the next page, pass `next_cursor` back as the `cursor` param. When `next_cursor` is `null`, you've reached the end.

### `GET /api/products/benchmark`

Runs an offset query and a keyset query side-by-side at depth 50,000 and returns the timings.

**Response:**

```json
{
  "offset_pagination_ms": 120,
  "keyset_pagination_ms": 3,
  "speedup": "40.0x faster",
  "note": "Both queries return the same page of data at depth 50,000"
}
```

### `GET /health`

Simple health check. Returns `{"status":"ok"}`.

---

## How the Cursor Works

1. The last row on each page has an `id` and `created_at`.
2. The server encodes those two values into a JSON payload, base64-encodes it, and signs it with HMAC-SHA256.
3. The resulting token is sent to the client as `next_cursor`.
4. When the client sends that token back, the server verifies the signature (using timing-safe comparison), decodes the payload, and uses those values in a `WHERE (created_at, id) < ($1, $2)` clause.
5. PostgreSQL uses the composite index to jump directly to the right position. No rows are scanned and discarded.

This means:
- **Clients can't forge cursors** — any tampering breaks the HMAC signature.
- **Query speed is constant** — page 1 and page 10,000 take the same time.
- **Concurrent inserts don't cause duplicates or skipped rows** — new rows land at the top and don't shift the cursor's position.

---

## Running the Concurrency Test

This script proves that keyset pagination stays stable even when new rows are inserted mid-pagination.

```bash
cd Backend
npm run test:concurrency
```

What it does:
1. Paginates through the entire product table, 100 items per page.
2. After page 5, it fires 50 concurrent INSERT statements — without pausing pagination.
3. Tracks every product ID it sees and checks for duplicates.
4. Prints `PASS` if no duplicates were found.

> Make sure the API server is running before you run this test.

---

## Tech Stack

| Layer     | Technology                                                    |
|-----------|---------------------------------------------------------------|
| Frontend  | React 19, Vite, React Router, Framer Motion, Lucide Icons     |
| Backend   | Node.js, Express 5, Zod (input validation)                    |
| Database  | PostgreSQL (tested with Neon serverless)                       |
| Security  | HMAC-SHA256 cursor signing, timing-safe comparison             |

---

## Available Scripts

### Backend (`cd Backend`)

| Command                  | What it does                                       |
|--------------------------|----------------------------------------------------|
| `npm run dev`            | Starts the server with nodemon (auto-restart)      |
| `npm start`              | Starts the server without auto-restart             |
| `npm run migrate`        | Creates the products table and indexes             |
| `npm run seed`           | Populates the database with 200,000 products       |
| `npm run test:concurrency` | Runs the concurrent-insert pagination test      |

### Frontend (`cd Frontend`)

| Command            | What it does                                |
|--------------------|---------------------------------------------|
| `npm run dev`      | Starts Vite dev server with hot reload      |
| `npm run build`    | Creates a production build in `dist/`       |
| `npm run preview`  | Serves the production build locally         |
| `npm run lint`     | Runs ESLint on the source code              |

---

## License

ISC
