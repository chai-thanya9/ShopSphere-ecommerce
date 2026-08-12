// routes/artsCraftsRoutes.js

const express = require("express");
const router = express.Router();

const {
  createArtsCrafts,
  getAllArtsCrafts,
  getArtsCraftsById,
  updateArtsCrafts,
  deleteArtsCrafts,
} = require("../controllers/artsCraftsController");

const {
  createArtsCraftsValidation,
  updateArtsCraftsValidation,
} = require("../middleware/artsCraftsValidation");

const validateRequest = require("../middleware/validationResult");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const upload = require("../middleware/uploads");

// ========================================
// CREATE ARTS & CRAFTS
// Vendor only
// ========================================

router.post(
  "/create",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  createArtsCraftsValidation,
  validateRequest,
  createArtsCrafts
);

// ========================================
// GET ALL ARTS & CRAFTS
// Public
// ========================================

router.get(
  "/",
  getAllArtsCrafts
);

// ========================================
// GET ARTS & CRAFTS BY ID
// Public
// ========================================

router.get(
  "/:id",
  getArtsCraftsById
);

// ========================================
// UPDATE ARTS & CRAFTS
// Vendor only
// ========================================

router.put(
  "/:id",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  updateArtsCraftsValidation,
  validateRequest,
  updateArtsCrafts
);

// ========================================
// PATCH ARTS & CRAFTS
// Vendor only
// ========================================

router.patch(
  "/:id",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  updateArtsCraftsValidation,
  validateRequest,
  updateArtsCrafts
);

// ========================================
// DELETE ARTS & CRAFTS
// Vendor only
// ========================================

router.delete(
  "/:id",
  authenticate,
  authorize("Vendor"),
  deleteArtsCrafts
);

module.exports = router;