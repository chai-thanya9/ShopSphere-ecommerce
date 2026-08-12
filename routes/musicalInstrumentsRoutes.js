// routes/musicalInstrumentsRoutes.js

const express = require("express");
const router = express.Router();

const {
  createMusicalInstrument,
  getAllMusicalInstruments,
  getMusicalInstrumentById,
  updateMusicalInstrument,
  deleteMusicalInstrument,
} = require("../controllers/musicalInstrumentsController");

const {
  createMusicalInstrumentValidation,
  updateMusicalInstrumentValidation,
} = require("../middleware/musicalInstrumentsValidation");

const validateRequest = require("../middleware/validationResult");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const upload = require("../middleware/uploads");

// ========================================
// CREATE
// Vendor only
// ========================================

router.post(
  "/create",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  createMusicalInstrumentValidation,
  validateRequest,
  createMusicalInstrument
);

// ========================================
// GET ALL
// Public
// ========================================

router.get(
  "/",
  getAllMusicalInstruments
);

// ========================================
// GET BY ID
// Public
// ========================================

router.get(
  "/:id",
  getMusicalInstrumentById
);

// ========================================
// UPDATE
// Vendor only
// ========================================

router.put(
  "/:id",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  updateMusicalInstrumentValidation,
  validateRequest,
  updateMusicalInstrument
);

// ========================================
// PATCH
// Vendor only
// ========================================

router.patch(
  "/:id",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  updateMusicalInstrumentValidation,
  validateRequest,
  updateMusicalInstrument
);

// ========================================
// DELETE
// Vendor only
// ========================================

router.delete(
  "/:id",
  authenticate,
  authorize("Vendor"),
  deleteMusicalInstrument
);

module.exports = router;