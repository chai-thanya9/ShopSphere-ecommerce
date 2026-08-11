const express = require("express");

const router = express.Router();

const {
  createFashion,
  getAllFashion,
  getFashionById,
  updateFashion,
  deleteFashion,
} = require("../controllers/fashionController");

const {
  createFashionValidation,
  updateFashionValidation,
} = require("../middleware/fashionValidation");

const validateRequest = require("../middleware/validationResult");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const upload = require("../middleware/uploads");

// ========================================
// CREATE FASHION
// ========================================

router.post(
  "/create",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  createFashionValidation,
  validateRequest,
  createFashion
);

// ========================================
// GET ALL FASHION
// ========================================

router.get(
  "/",
  getAllFashion
);

// ========================================
// GET FASHION BY ID
// ========================================

router.get(
  "/:id",
  getFashionById
);

// ========================================
// PATCH FASHION
// ========================================

router.patch(
  "/:id",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  updateFashionValidation,
  validateRequest,
  updateFashion
);

// ========================================
// DELETE FASHION
// ========================================

router.delete(
  "/:id",
  authenticate,
  authorize("Vendor"),
  deleteFashion
);

module.exports = router;