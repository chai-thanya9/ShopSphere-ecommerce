const express = require("express");
const router = express.Router();

const {
  createHealthCare,
  getAllHealthCare,
  getHealthCareById,
  updateHealthCare,
  deleteHealthCare,
} = require("../controllers/healthCareController");

const {
  createHealthCareValidation,
  updateHealthCareValidation,
} = require("../middleware/healthCareValidation");

const validateRequest = require("../middleware/validationResult");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const upload = require("../middleware/uploads");

// ========================================
// CREATE HEALTH CARE
// Vendor Only
// ========================================

router.post(
  "/create",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  createHealthCareValidation,
  validateRequest,
  createHealthCare
);

// ========================================
// GET ALL HEALTH CARE
// Public Product Access
// ========================================

router.get(
  "/",
  getAllHealthCare
);

// ========================================
// GET HEALTH CARE BY ID
// Public Product Access
// ========================================

router.get(
  "/:id",
  getHealthCareById
);

// ========================================
// UPDATE HEALTH CARE
// Vendor Only
// ========================================

router.put(
  "/:id",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  updateHealthCareValidation,
  validateRequest,
  updateHealthCare
);

// ========================================
// PATCH HEALTH CARE
// Vendor Only
// ========================================

router.patch(
  "/:id",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  updateHealthCareValidation,
  validateRequest,
  updateHealthCare
);

// ========================================
// DELETE HEALTH CARE
// Vendor Only
// ========================================

router.delete(
  "/:id",
  authenticate,
  authorize("Vendor"),
  deleteHealthCare
);

module.exports = router;