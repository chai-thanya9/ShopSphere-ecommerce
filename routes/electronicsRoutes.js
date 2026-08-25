const express = require("express");

const router = express.Router();

const {
  createElectronics,
  getAllElectronics,
  getElectronicsById,
  updateElectronics,
  patchElectronics,
  deleteElectronics,
} = require("../controllers/electronicsController");

const {
  createElectronicsValidation,
  updateElectronicsValidation,
} = require("../middleware/electronicsValidation");

const validateRequest = require("../middleware/validationResult");
const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploads");

// ========================================
// CREATE
// ========================================

router.post(
  "/create",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  createElectronicsValidation,
  validateRequest,
  createElectronics
);

// ========================================
// GET ALL
// No vendor restriction
// ========================================

router.get(
  "/",
  getAllElectronics
);

// ========================================
// GET BY ID
// No vendor restriction
// ========================================

router.get(
  "/:id",
  getElectronicsById
);

// ========================================
// PUT UPDATE
// Vendor restriction
// ========================================

router.put(
  "/:id",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  updateElectronicsValidation,
  validateRequest,
  updateElectronics
);

// ========================================
// PATCH UPDATE
// Vendor restriction
// ========================================

router.patch(
  "/:id",
  authenticate,
  authorize("vendor"),
  upload.array("images", 10),
  updateElectronicsValidation,
  validateRequest,
  patchElectronics
);

// ========================================
// DELETE
// Vendor restriction
// ========================================

router.delete(
  "/:id",
  authenticate,
  authorize("vendor"),
  deleteElectronics
);

module.exports = router;