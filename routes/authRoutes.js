const express = require("express");

const router = express.Router();

const {
  adminLogin,
  registerUser,
  sendEmailOtp,
  verifyEmailOtp,
  loginUser,
} = require("../controllers/authController");

router.post(
  "/admin/login",
  adminLogin
);

router.post(
  "/register",
  registerUser
);

router.post(
  "/send-otp",
  sendEmailOtp
);

router.post(
  "/verify-email",
  verifyEmailOtp
);

router.post(
  "/login",
  loginUser
);

module.exports = router;