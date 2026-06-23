require("dotenv").config();
const express = require("express");
const productsRouter = require("./routes/products");

const app = express();
const PORT = process.env.PORT || 3000;
const cors = require("cors");
app.use(cors());
app.use(express.json());

// Health check — Render pings this to know the app is alive
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// All product routes live under /api/products
app.use("/api/products", productsRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});