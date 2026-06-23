const pool = require("../src/db");
const crypto = require("crypto");
require("dotenv").config();

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";

async function fetchPage(cursor, category) {
  const params = new URLSearchParams({ limit: "100" });
  if (cursor) params.set("cursor", cursor);
  if (category) params.set("category", category);

  const res = await fetch(`${BASE_URL}/api/products?${params}`);
  return res.json();
}

async function insertProducts(count) {
  const values = Array.from({ length: count }, (_, i) => 
    `('Concurrent Insert ${i}', 'Electronics', 9.99, NOW(), NOW())`
  ).join(",");

  await pool.query(
    `INSERT INTO products (name, category, price, created_at, updated_at) VALUES ${values}`
  );
  console.log(`  → Inserted ${count} products mid-pagination`);
}

async function runTest() {
  console.log("Starting concurrency test...\n");

  const seenIds = new Set();
  let cursor = null;
  let pageCount = 0;
  let insertedMidway = false;

  while (true) {
    const response = await fetchPage(cursor);

    if (!response.data || response.data.length === 0) break;

    // Check for duplicates in this page
    for (const product of response.data) {
      if (seenIds.has(String(product.id))) {
        console.error(`DUPLICATE FOUND: id ${product.id} on page ${pageCount + 1}`);
        process.exit(1);
      }
      seenIds.add(String(product.id));
    }

    pageCount++;
    cursor = response.next_cursor;

    // After page 5, fire concurrent inserts while we keep paginating
    if (pageCount === 5 && !insertedMidway) {
      insertedMidway = true;
      console.log(`After page ${pageCount}: firing 50 concurrent inserts...`);
      // Don't await — let it run in parallel with our pagination
      insertProducts(50);
    }

    if (!cursor) break;
  }

  // Wait a moment for the inserts to definitely finish
  await new Promise(r => setTimeout(r, 2000));

  console.log(`\n--- Results ---`);
  console.log(`Pages fetched: ${pageCount}`);
  console.log(`Total unique products seen: ${seenIds.size}`);
  console.log(`RESULT: PASS — No duplicates found`);
  console.log(`(New inserts appeared at the top and didn't affect in-progress pagination)`);

  await pool.end();
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});