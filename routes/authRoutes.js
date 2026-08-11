const express = require("express");
const router = express.Router();

const {
  adminLogin,
  registerUser,
  verifyEmailOtp,
  loginUser,
} = require("../controllers/authController");

// ========================================
// ADMIN LOGIN
// ========================================

router.post(
  "/admin/login",
  adminLogin
);

// ========================================
// CUSTOMER REGISTER
// ========================================

router.post(
  "/register",
  registerUser
);

// ========================================
// VERIFY EMAIL OTP
// ========================================

router.post(
  "/verify-email",
  verifyEmailOtp
);

// ========================================
// CUSTOMER LOGIN
// ========================================

router.post(
  "/login",
  loginUser
);

module.exports = router;