const express = require("express");
const multer = require("multer");

const router = express.Router();


// ========================================
// CONTROLLERS
// ========================================

const {
  createAppliances,
  getAllAppliances,
  getApplianceById,
  updateAppliances,
  deleteAppliances,
  bulkUploadAppliances,
} = require("../controllers/appliancesController");


// ========================================
// VALIDATION
// ========================================

const {
  createAppliancesValidation,
  updateAppliancesValidation,
  validateAppliancesBulkUpload,
} = require("../middleware/appliancesValidation");

const validateRequest = require("../middleware/validationResult");


// ========================================
// AUTHENTICATION
// ========================================

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");


// ========================================
// IMAGE UPLOAD
// ========================================

const upload = require("../middleware/uploads");


// ========================================
// BULK FILE UPLOAD
// CSV / EXCEL
// ========================================

const bulkUpload = multer({
  dest: "uploads/bulk/",
});


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
// BULK UPLOAD APPLIANCES
// CSV / XLS / XLSX
// Vendor only
// ========================================

router.post(
  "/bulk-upload",
  authenticate,
  authorize("Vendor"),
  bulkUpload.single("file"),
  validateAppliancesBulkUpload,
  bulkUploadAppliances
);


// ========================================
// GET ALL APPLIANCES
// Public
// ========================================

router.get(
  "/",
  getAllAppliances
);


// ========================================
// GET APPLIANCE BY ID
// Public
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