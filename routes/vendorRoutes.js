const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  createVendor,
  sendVendorOtp,
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

// CREATE VENDOR
router.post(
  "/create",
  authenticate,
  authorize("Admin"),
  createVendor
);

// GET ALL VENDORS
router.get(
  "/",
  authenticate,
  authorize("Admin"),
  getAllVendors
);

// GET VENDOR BY ID
router.get(
  "/:id",
  authenticate,
  authorize("Admin"),
  getVendorById
);

// UPDATE VENDOR
router.patch(
  "/:id",
  authenticate,
  authorize("Admin"),
  updateVendor
);

// DELETE VENDOR
router.delete(
  "/:id",
  authenticate,
  authorize("Admin"),
  deleteVendor
);

// ========================================
// VENDOR
// ========================================

// SEND OTP
router.post(
  "/send-otp",
  sendVendorOtp
);

// VERIFY VENDOR
router.post(
  "/verify",
  verifyVendor
);

// VENDOR LOGIN
router.post(
  "/login",
  vendorLogin
);

module.exports = router;