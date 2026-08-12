// routes/stationeryRoutes.js

const express = require("express");
const router = express.Router();

const {
  createStationery,
  getAllStationery,
  getStationeryById,
  updateStationery,
  deleteStationery,
} = require("../controllers/stationeryController");

const {
  createStationeryValidation,
  updateStationeryValidation,
} = require("../middleware/stationeryValidation");

const validateRequest = require("../middleware/validationResult");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const upload = require("../middleware/uploads");

// ========================================
// CREATE STATIONERY
// Vendor only
// ========================================

router.post(
  "/create",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  createStationeryValidation,
  validateRequest,
  createStationery
);

// ========================================
// GET ALL STATIONERY
// Public
// ========================================

router.get(
  "/",
  getAllStationery
);

// ========================================
// GET STATIONERY BY ID
// Public
// ========================================

router.get(
  "/:id",
  getStationeryById
);

// ========================================
// UPDATE STATIONERY
// Vendor only
// ========================================

router.put(
  "/:id",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  updateStationeryValidation,
  validateRequest,
  updateStationery
);

// ========================================
// PATCH STATIONERY
// Vendor only
// ========================================

router.patch(
  "/:id",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  updateStationeryValidation,
  validateRequest,
  updateStationery
);

// ========================================
// DELETE STATIONERY
// Vendor only
// ========================================

router.delete(
  "/:id",
  authenticate,
  authorize("Vendor"),
  deleteStationery
);

module.exports = router;