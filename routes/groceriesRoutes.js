// routes/groceriesRoutes.js

const express = require("express");
const router = express.Router();

const {
  createGroceries,
  getAllGroceries,
  getGroceriesById,
  updateGroceries,
  deleteGroceries,
} = require("../controllers/groceriesController");

const {
  createGroceriesValidation,
  updateGroceriesValidation,
} = require("../middleware/groceriesValidation");

const validateRequest = require("../middleware/validationResult");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const upload = require("../middleware/uploads");

// ========================================
// CREATE GROCERY
// Vendor only
// ========================================

router.post(
  "/create",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  createGroceriesValidation,
  validateRequest,
  createGroceries
);

// ========================================
// GET ALL GROCERY PRODUCTS
// Customer / User can view
// ========================================

router.get(
  "/",
  getAllGroceries
);

// ========================================
// GET GROCERY BY ID
// Customer / User can view
// ========================================

router.get(
  "/:id",
  getGroceriesById
);

// ========================================
// UPDATE GROCERY
// Vendor only
// ========================================

router.put(
  "/:id",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  updateGroceriesValidation,
  validateRequest,
  updateGroceries
);

// ========================================
// PATCH GROCERY
// Vendor only
// ========================================

router.patch(
  "/:id",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  updateGroceriesValidation,
  validateRequest,
  updateGroceries
);

// ========================================
// DELETE GROCERY
// Vendor only
// ========================================

router.delete(
  "/:id",
  authenticate,
  authorize("Vendor"),
  deleteGroceries
);

module.exports = router;