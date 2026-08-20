const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  getAllProducts,
  getProductsByCategory,
  getProductById,
} = require("../controllers/productController");

// ========================================
// GET ALL PRODUCTS
// Customer + Admin
// ========================================

router.get(
  "/",
  authenticate,
  authorize("Customer", "Admin"),
  getAllProducts
);

// ========================================
// GET PRODUCTS BY CATEGORY
// ========================================

router.get(
  "/category/:category",
  authenticate,
  authorize("Customer", "Admin"),
  getProductsByCategory
);

// ========================================
// GET PRODUCT BY ID
// ========================================

router.get(
  "/:category/:id",
  authenticate,
  authorize("Customer", "Admin"),
  getProductById
);

module.exports = router;