const express = require("express");
const router = express.Router();

const {
  createBeauty,
  getAllBeauty,
  getBeautyById,
  updateBeauty,
  deleteBeauty,
} = require("../controllers/beautyController");

const {
  createBeautyValidation,
  updateBeautyValidation,
} = require("../middleware/beautyValidation");

const validateRequest = require("../middleware/validationResult");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const upload = require("../middleware/uploads");

// ========================================
// CREATE BEAUTY
// Vendor only
// ========================================

router.post(
  "/create",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  createBeautyValidation,
  validateRequest,
  createBeauty
);

// ========================================
// GET ALL BEAUTY
// Public - No authentication
// ========================================

router.get(
  "/",
  getAllBeauty
);

// ========================================
// GET BEAUTY BY ID
// Public - No authentication
// ========================================

router.get(
  "/:id",
  getBeautyById
);

// ========================================
// UPDATE BEAUTY
// Vendor only
// ========================================

router.put(
  "/:id",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  updateBeautyValidation,
  validateRequest,
  updateBeauty
);

// ========================================
// PATCH BEAUTY
// Vendor only
// ========================================

router.patch(
  "/:id",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  updateBeautyValidation,
  validateRequest,
  updateBeauty
);

// ========================================
// DELETE BEAUTY
// Vendor only
// ========================================

router.delete(
  "/:id",
  authenticate,
  authorize("Vendor"),
  deleteBeauty
);

module.exports = router;