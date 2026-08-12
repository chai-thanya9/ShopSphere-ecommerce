const express = require("express");

const router = express.Router();

const {
  createFurniture,
  getAllFurniture,
  getFurnitureById,
  updateFurniture,
  deleteFurniture,
} = require("../controllers/furnitureController");

const {
  createFurnitureValidation,
  updateFurnitureValidation,
} = require("../middleware/furnitureValidation");

const validateRequest = require("../middleware/validationResult");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const upload = require("../middleware/uploads");

// ========================================
// CREATE FURNITURE
// Vendor only
// ========================================

router.post(
  "/create",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  createFurnitureValidation,
  validateRequest,
  createFurniture
);

// ========================================
// GET ALL FURNITURE
// PUBLIC
// ========================================

router.get(
  "/",
  getAllFurniture
);

// ========================================
// GET FURNITURE BY ID
// PUBLIC
// ========================================

router.get(
  "/:id",
  getFurnitureById
);

// ========================================
// UPDATE FURNITURE
// Vendor only
// ========================================

router.put(
  "/:id",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  updateFurnitureValidation,
  validateRequest,
  updateFurniture
);

// ========================================
// PATCH FURNITURE
// Vendor only
// ========================================

router.patch(
  "/:id",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  updateFurnitureValidation,
  validateRequest,
  updateFurniture
);



router.delete(
  "/:id",
  authenticate,
  authorize("Vendor"),
  deleteFurniture
);

module.exports = router;