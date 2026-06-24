const express = require("express");
const crypto = require("crypto");
const { z } = require("zod");
const pool = require("../db");

const router = express.Router();
const SECRET = process.env.HMAC_SECRET;

// --- Cursor helpers ---

// Takes { id, created_at } and turns it into a signed token
// So clients can't forge or tamper with cursor values
function encodeCursor(id, createdAt) {
  const payload = JSON.stringify({ id, created_at: createdAt });
  const data = Buffer.from(payload).toString("base64");
  const sig = crypto.createHmac("sha256", SECRET).update(data).digest("hex");
  return `${data}.${sig}`;
}

// Takes the token back, verifies signature, returns { id, created_at }
// Throws if tampered or malformed
function decodeCursor(cursor) {
  const [data, sig] = cursor.split(".");
  if (!data || !sig) throw new Error("Malformed cursor");

  const expectedSig = crypto.createHmac("sha256", SECRET).update(data).digest("hex");

  // Timing-safe comparison to prevent timing attacks
  const sigBuffer = Buffer.from(sig, "hex");
  const expectedBuffer = Buffer.from(expectedSig, "hex");

  if (
    sigBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    throw new Error("Invalid cursor signature");
  }

  const payload = JSON.parse(Buffer.from(data, "base64").toString("utf8"));
  return payload; // { id, created_at }
}

// --- Input validation schema ---
const querySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 20))
    .pipe(z.number().min(1).max(100)),
  category: z.string().optional(),
  cursor: z.string().optional(),
});

// --- GET /api/products ---
router.get("/", async (req, res) => {
  // 1. Validate query params
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { limit, category, cursor } = parsed.data;

  try {
    let cursorData = null;

    // 2. Decode cursor if present
    if (cursor) {
      try {
        cursorData = decodeCursor(cursor);
      } catch {
        return res.status(400).json({ error: "Invalid or tampered cursor" });
      }
    }

    // 3. Build and run the query
    // Two cases: first page (no cursor) vs subsequent pages (with cursor)
    let rows;

    if (!cursorData) {
      // First page — no cursor condition, just filter by category if given
      const result = await pool.query(
        `SELECT id, name, category, price, created_at, updated_at
         FROM products
         WHERE ($1::text IS NULL OR category = $1)
         ORDER BY created_at DESC, id DESC
         LIMIT $2`,
        [category ?? null, limit]
      );
      rows = result.rows;

    } else {
      // Subsequent pages — the keyset condition
      // (created_at, id) < (cursor_created_at, cursor_id)
      // This is what makes pagination stable under concurrent inserts
      const result = await pool.query(
        `SELECT id, name, category, price, created_at, updated_at
         FROM products
         WHERE ($1::text IS NULL OR category = $1)
           AND (created_at, id) < ($2::timestamptz, $3::bigint)
         ORDER BY created_at DESC, id DESC
         LIMIT $4`,
        [category ?? null, cursorData.created_at, cursorData.id, limit]
      );
      rows = result.rows;
    }

    // 4. Build next_cursor from the last row
    // If we got fewer rows than the limit, there's no next page
    let next_cursor = null;
    if (rows.length === limit) {
      const last = rows[rows.length - 1];
      next_cursor = encodeCursor(last.id, last.created_at);
    }

    // 5. Return response
    return res.json({
      data: rows,
      next_cursor,
      count: rows.length,
    });

  } catch (err) {
    console.error("Error in GET /products:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// --- GET /api/products/paged ---
// Offset-based page-number pagination for the catalog UI
const pagedQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 1))
    .pipe(z.number().min(1)),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 20))
    .pipe(z.number().min(1).max(100)),
  category: z.string().optional(),
});

router.get("/paged", async (req, res) => {
  const parsed = pagedQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { page, limit, category } = parsed.data;
  const offset = (page - 1) * limit;

  try {
    // Get total count for pagination metadata
    const countResult = await pool.query(
      `SELECT COUNT(*) AS total FROM products
       WHERE ($1::text IS NULL OR category = $1)`,
      [category ?? null]
    );
    const total_count = parseInt(countResult.rows[0].total, 10);
    const total_pages = Math.ceil(total_count / limit);

    // Fetch the page of data
    const result = await pool.query(
      `SELECT id, name, category, price, created_at, updated_at
       FROM products
       WHERE ($1::text IS NULL OR category = $1)
       ORDER BY created_at DESC, id DESC
       LIMIT $2 OFFSET $3`,
      [category ?? null, limit, offset]
    );

    return res.json({
      data: result.rows,
      page,
      limit,
      total_count,
      total_pages,
    });
  } catch (err) {
    console.error("Error in GET /products/paged:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// --- GET /api/products/benchmark ---
// Compares offset vs keyset speed at depth 50,000
// This is your proof that keyset is faster
router.get("/benchmark", async (req, res) => {
  try {
    // Offset query — simulating page 2500 (50000 / 20)
    const t1 = Date.now();
    await pool.query(
      `SELECT id, name, category, price, created_at, updated_at
       FROM products
       ORDER BY created_at DESC, id DESC
       LIMIT 20 OFFSET 50000`
    );
    const offsetTime = Date.now() - t1;

    // Find the actual cursor at position 50000 for a fair comparison
    const anchor = await pool.query(
      `SELECT id, created_at FROM products
       ORDER BY created_at DESC, id DESC
       LIMIT 1 OFFSET 49999`
    );
    const anchorRow = anchor.rows[0];

    // Keyset query at same depth
    const t2 = Date.now();
    await pool.query(
      `SELECT id, name, category, price, created_at, updated_at
       FROM products
       WHERE (created_at, id) < ($1::timestamptz, $2::bigint)
       ORDER BY created_at DESC, id DESC
       LIMIT 20`,
      [anchorRow.created_at, anchorRow.id]
    );
    const keysetTime = Date.now() - t2;

    return res.json({
      offset_pagination_ms: offsetTime,
      keyset_pagination_ms: keysetTime,
      speedup: `${(offsetTime / keysetTime).toFixed(1)}x faster`,
      note: "Both queries return the same page of data at depth 50,000",
    });

  } catch (err) {
    console.error("Benchmark error:", err);
    return res.status(500).json({ error: "Benchmark failed" });
  }
});

module.exports = router;