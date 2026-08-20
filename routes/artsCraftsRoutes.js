// routes/artsCraftsRoutes.js

const express = require("express");
const multer = require("multer");
const bulkUpload = multer({
  dest: "uploads/bulk/",
});




const router = express.Router();

const {
  createArtsCrafts,
  bulkUploadArtsCrafts,
  getAllArtsCrafts,
  getArtsCraftsById,
  updateArtsCrafts,
  deleteArtsCrafts,
} = require("../controllers/artsCraftsController");

const {
  createArtsCraftsValidation,
  updateArtsCraftsValidation,
  validateArtsCraftsBulkUpload,
} = require("../middleware/artsCraftsValidation");

const validateRequest = require("../middleware/validationResult");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const upload = require("../middleware/uploads");

// ========================================
// CREATE ARTS & CRAFTS
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
// BULK UPLOAD ARTS & CRAFTS
// ========================================



router.post(
  "/bulk-upload",
  authenticate,
  authorize("Vendor"),
  bulkUpload.single("file"),
  validateArtsCraftsBulkUpload,
  bulkUploadArtsCrafts
);

// ========================================
// GET ALL ARTS & CRAFTS
// ========================================

router.get(
  "/",
  getAllArtsCrafts
);

// ========================================
// GET BY ID
// ========================================

router.get(
  "/:id",
  getArtsCraftsById
);

// ========================================
// UPDATE
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
// PATCH
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
// DELETE
// ========================================

router.delete(
  "/:id",
  authenticate,
  authorize("Vendor"),
  deleteArtsCrafts
);

module.exports = router;