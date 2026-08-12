// routes/toysRoutes.js

const express = require("express");
const router = express.Router();

const {
  createToys,
  getAllToys,
  getToyById,
  updateToy,
  deleteToy,
} = require("../controllers/toysController");

const {
  createToysValidation,
  updateToysValidation,
} = require("../middleware/toysValidation");

const validateRequest = require("../middleware/validationResult");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const upload = require("../middleware/uploads");

// ========================================
// CREATE TOY
// Vendor only
// ========================================

router.post(
  "/create",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  createToysValidation,
  validateRequest,
  createToys
);

// ========================================
// GET ALL TOYS
// Public
// ========================================

router.get(
  "/",
  getAllToys
);

// ========================================
// GET TOY BY ID
// Public
// ========================================

router.get(
  "/:id",
  getToyById
);

// ========================================
// UPDATE TOY
// Vendor only
// ========================================

router.put(
  "/:id",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  updateToysValidation,
  validateRequest,
  updateToy
);

// ========================================
// PATCH TOY
// Vendor only
// ========================================

router.patch(
  "/:id",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  updateToysValidation,
  validateRequest,
  updateToy
);

// ========================================
// DELETE TOY
// Vendor only
// ========================================

router.delete(
  "/:id",
  authenticate,
  authorize("Vendor"),
  deleteToy
);

module.exports = router;