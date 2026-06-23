const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
});

const CATEGORIES = ["Electronics", "Clothing", "Books", "Home & Kitchen", "Sports & Outdoors", "Beauty & Personal Care", "Toys & Games", "Automotive"];
const ADJECTIVES = ["Premium", "Budget", "Deluxe", "Classic", "Modern", "Vintage"];
const NOUNS = ["Widget", "Gadget", "Item", "Product", "Thing", "Unit", "Pack"];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPrice() {
  return (Math.random() * 994 + 5).toFixed(2);
}

function randomDate(start, end) {
  const ms = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(ms).toISOString();
}

async function seed() {
  const TOTAL = 200_000;
  const BATCH_SIZE = 1000; // smaller batches = less likely to timeout
  const startDate = new Date("2020-01-01");
  const endDate = new Date("2024-12-31");

  // Wake up the connection first
  console.log("Waking up database...");
  await pool.query("SELECT 1");
  console.log("Connected!");

  console.log("Clearing existing products...");
  await pool.query("DELETE FROM products");
  console.log("Cleared!");

  console.log(`Seeding ${TOTAL.toLocaleString()} products in batches of ${BATCH_SIZE}...`);
  const startTime = Date.now();

  for (let offset = 0; offset < TOTAL; offset += BATCH_SIZE) {
    const batchCount = Math.min(BATCH_SIZE, TOTAL - offset);

    const values = [];
    const params = [];
    let paramIndex = 1;

    for (let i = 0; i < batchCount; i++) {
      const name = `${randomItem(ADJECTIVES)} ${randomItem(NOUNS)} ${offset + i + 1}`;
      const category = randomItem(CATEGORIES);
      const price = randomPrice();
      const createdAt = randomDate(startDate, endDate);
      const updatedAt = randomDate(new Date(createdAt), endDate);

      values.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
      params.push(name, category, price, createdAt, updatedAt);
    }

    await pool.query(
      `INSERT INTO products (name, category, price, created_at, updated_at) VALUES ${values.join(",")}`,
      params
    );

    // Show progress every 10k rows
    if (offset % 10_000 === 0) {
      const done = offset + batchCount;
      const pct = ((done / TOTAL) * 100).toFixed(1);
      console.log(`  ${done.toLocaleString()} / ${TOTAL.toLocaleString()} (${pct}%)`);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`Done! Seeded ${TOTAL.toLocaleString()} products in ${elapsed}s`);
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});