const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  createVendor,
  verifyVendor,
  vendorLogin,

  getAllVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
} = require("../controllers/vendorController");


// ========================================
// ADMIN
// ========================================


// ========================================
// CREATE VENDOR
// Admin only
// ========================================

router.post(
  "/create",
  authenticate,
  authorize("Admin"),
  createVendor
);


// ========================================
// GET ALL VENDORS
// Admin only
// ========================================

router.get(
  "/",
  authenticate,
  authorize("Admin"),
  getAllVendors
);


// ========================================
// GET VENDOR BY ID
// Admin only
// ========================================

router.get(
  "/:id",
  authenticate,
  authorize("Admin,user"),
  getVendorById
);


// ========================================
// UPDATE VENDOR
// Admin only
// ========================================

router.patch(
  "/:id",
  authenticate,
  authorize("Admin,vendor"),
  updateVendor
);


// ========================================
// DELETE VENDOR
// Admin only
// ========================================

router.delete(
  "/:id",
  authenticate,
  authorize("Admin,vendor"),
  deleteVendor
);


// ========================================
// VENDOR
// ========================================


// ========================================
// VERIFY VENDOR
// Public
// ========================================

router.post(
  "/verify",
  verifyVendor
);


// ========================================
// VENDOR LOGIN
// Public
// ========================================

router.post(
  "/login",
  vendorLogin
);


module.exports = router;