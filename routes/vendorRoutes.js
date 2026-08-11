const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  createVendor,
  sendVendorOtp,
  verifyVendor,
  vendorLogin,
} = require("../controllers/vendorController");

// Admin
router.post(
  "/create",
  authenticate,
  authorize("Admin"),
  createVendor
);

// Vendor
router.post("/send-otp", sendVendorOtp);
router.post("/verify", verifyVendor);
router.post("/login", vendorLogin);

module.exports = router;