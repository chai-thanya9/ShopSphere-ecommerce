const express = require("express");

const router = express.Router();

const {
  createSports,
  getAllSports,
  getSportsById,
  updateSports,
  deleteSports,
} = require("../controllers/sportsController");

const {
  createSportsValidation,
  updateSportsValidation,
} = require("../middleware/sportsValidation");

const validateRequest = require("../middleware/validationResult");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const upload = require("../middleware/uploads");

// ========================================
// CREATE SPORTS
// Vendor only
// ========================================

router.post(
  "/create",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  createSportsValidation,
  validateRequest,
  createSports
);

// ========================================
// GET ALL SPORTS
// PUBLIC
// ========================================

router.get(
  "/",
  getAllSports
);

// ========================================
// GET SPORTS BY ID
// PUBLIC
// ========================================

router.get(
  "/:id",
  getSportsById
);

// ========================================
// UPDATE SPORTS
// Vendor only
// ========================================

router.put(
  "/:id",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  updateSportsValidation,
  validateRequest,
  updateSports
);

// ========================================
// PATCH SPORTS
// Vendor only
// ========================================

router.patch(
  "/:id",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  updateSportsValidation,
  validateRequest,
  updateSports
);

// ========================================
// DELETE SPORTS
// Vendor only
// ========================================

router.delete(
  "/:id",
  authenticate,
  authorize("Vendor"),
  deleteSports
);

module.exports = router;