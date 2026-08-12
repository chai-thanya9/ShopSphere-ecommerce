const express = require("express");

const router = express.Router();

const {
  createAppliances,
  getAllAppliances,
  getApplianceById,
  updateAppliances,
  deleteAppliances,
} = require("../controllers/appliancesController");

const {
  createAppliancesValidation,
  updateAppliancesValidation,
} = require("../middleware/appliancesValidation");

const validateRequest = require("../middleware/validationResult");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const upload = require("../middleware/uploads");

// ========================================
// CREATE APPLIANCE
// Vendor only
// ========================================

router.post(
  "/create",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  createAppliancesValidation,
  validateRequest,
  createAppliances
);

// ========================================
// GET ALL APPLIANCES
// Customer / Public
// ========================================

router.get(
  "/",
  getAllAppliances
);

// ========================================
// GET APPLIANCE BY ID
// Customer / Public
// ========================================

router.get(
  "/:id",
  getApplianceById
);

// ========================================
// UPDATE APPLIANCE
// Vendor only
// ========================================

router.put(
  "/:id",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  updateAppliancesValidation,
  validateRequest,
  updateAppliances
);

// ========================================
// PATCH APPLIANCE
// Vendor only
// ========================================

router.patch(
  "/:id",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  updateAppliancesValidation,
  validateRequest,
  updateAppliances
);

// ========================================
// DELETE APPLIANCE
// Vendor only
// ========================================

router.delete(
  "/:id",
  authenticate,
  authorize("Vendor"),
  deleteAppliances
);

module.exports = router;