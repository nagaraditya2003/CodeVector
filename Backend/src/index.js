require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const productsRouter = require("./routes/products");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/products", productsRouter);

// Serve React build — Frontend/dist folder
app.use(express.static(path.join(__dirname, "../../Frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../Frontend/dist", "index.html"));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));