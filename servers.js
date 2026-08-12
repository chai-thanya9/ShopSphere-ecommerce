require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Database
const sequelize = require("./config/database");

// Routes
const authRoutes = require("./routes/authRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const booksRoutes = require("./routes/booksRoutes");
const fashionRoutes = require("./routes/fashionRoutes");
const electronicsRoutes = require("./routes/electronicsRoutes");
const beautyRoutes = require("./routes/beautyRoutes");
const homeRoutes = require("./routes/homeRoutes");
const appliancesRoutes = require("./routes/appliancesRoutes");
const furnitureRoutes = require("./routes/furnitureRoutes");
const sportsRoutes = require("./routes/sportsRoutes");
const healthCareRoutes = require("./routes/healthCareRoutes");
const groceriesRoutes = require("./routes/groceriesRoutes");
const toysRoutes = require("./routes/toysRoutes");
const stationeryRoutes = require("./routes/stationeryRoutes");
const musicalInstrumentsRoutes = require("./routes/musicalInstrumentsRoutes");
const artsCraftsRoutes = require("./routes/artsCraftsRoutes");



const orderRoutes = require("./routes/orderRoutes");

// Import all models + associations
require("./models");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/books", booksRoutes);
app.use("/api/fashion", fashionRoutes);
app.use("/api/electronics", electronicsRoutes);
app.use("/api/beauty", beautyRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/appliances", appliancesRoutes);
app.use("/api/furniture", furnitureRoutes);
app.use("/api/sports", sportsRoutes);
app.use("/api/healthcare", healthCareRoutes);
app.use("/api/groceries", groceriesRoutes);
app.use("/api/toys", toysRoutes);
app.use("/api/stationery", stationeryRoutes);
app.use("/api/musical-instruments", musicalInstrumentsRoutes);
app.use("/api/arts-crafts", artsCraftsRoutes);
app.use("/api/orders", orderRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("ShopSphere Backend Running...");
});

// Sync Database & Start Server
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database Connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database Connection Error:", err);
  });