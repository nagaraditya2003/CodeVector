const pool = require("../src/db");

async function migrate() {
  console.log("Running migrations...");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id        BIGSERIAL PRIMARY KEY,
      name      TEXT NOT NULL,
      category  TEXT NOT NULL,
      price     NUMERIC(10, 2) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // This index is what makes keyset pagination fast
  // Without this, every paginated query does a full table scan
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_products_cursor
    ON products (created_at DESC, id DESC)
  `);

  // This index makes category-filtered pagination fast
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_products_category_cursor
    ON products (category, created_at DESC, id DESC)
  `);

  console.log("Done. Table and indexes created.");
  await pool.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});