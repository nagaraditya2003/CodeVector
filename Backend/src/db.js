const { Pool } = require("pg");
require("dotenv").config();

// One pool shared across the whole app
// pg handles connection reuse automatically
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon requires SSL
});

module.exports = pool;