const User = require("../models/Users");
const Vendor = require("../models/Vendor");
const { generateOTP } = require("../utils/otpGenerator");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  sendEmailOtp,
  sendTemporaryPassword,
} = require("../utils/sendEmail");

// ======================================
// Admin Create Vendor
// ======================================
exports.createVendor = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      mobileNumber,
      vendorName,
      businessType,
      shopName,
      dateOfBirth,
    } = req.body;

    // Check Email
    const emailExists = await User.findOne({
      where: { email },
    });

    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists.",
      });
    }

    // Check Mobile
    const mobileExists = await User.findOne({
      where: { mobileNumber },
    });

    if (mobileExists) {
      return res.status(400).json({
        success: false,
        message: "Mobile number already exists.",
      });
    }

    // Create User
    const user = await User.create({
      firstName,
      lastName,
      email,
      mobileNumber,

      role: "Vendor",

      password: null,

      isEmailVerified: false,
      isMobileVerified: false,
    });

    // Create Vendor
    const vendor = await Vendor.create({
      userId: user.id,
      vendorName,
      businessType,
      shopName,
      dateOfBirth,

      status: "Pending",
      isVerified: false,
    });

    return res.status(201).json({
      success: true,
      message: "Vendor created successfully.",
      data: {
        userId: user.id,
        vendorId: vendor.id,
        status: vendor.status,
      },
    });
  } catch (error) {
    console.error("Create Vendor Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ======================================
// Vendor Send OTP
// ======================================
exports.sendVendorOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Find Vendor User
    const user = await User.findOne({
      where: {
        email,
        role: "Vendor",
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found.",
      });
    }

    // Generate Email OTP
    const emailOtp = generateOTP();

    // OTP Expiry (10 Minutes)
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP
    await user.update({
      emailOtp,
      emailOtpExpires: otpExpiry,
      emailOtpAttempts: 0,
    });

    // Send Email
    await sendEmailOtp(user.email, emailOtp);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully. Please check your email.",
    });

  } catch (error) {
    console.error("Send OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ======================================
// Vendor Verify
// ======================================


exports.verifyVendor = async (req, res) => {
  try {
    const {
      email,
      emailOtp,
    } = req.body;

    // ==========================
    // Find Vendor User
    // ==========================
    const user = await User.findOne({
      where: {
        email,
        role: "Vendor",
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found.",
      });
    }

    // ==========================
    // Find Vendor Details
    // ==========================
    const vendor = await Vendor.findOne({
      where: {
        userId: user.id,
      },
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor details not found.",
      });
    }

    // ==========================
    // OTP Attempts
    // ==========================
    if (user.emailOtpAttempts >= 10) {
      return res.status(400).json({
        success: false,
        message:
          "Maximum OTP attempts exceeded. Please request a new OTP.",
      });
    }

    // ==========================
    // Email OTP Check
    // ==========================
    if (
      String(user.emailOtp).trim() !==
      String(emailOtp).trim()
    ) {
      await user.increment("emailOtpAttempts");

      return res.status(400).json({
        success: false,
        message: "Invalid Email OTP.",
      });
    }

    // ==========================
    // OTP Expiry Check
    // ==========================
    if (
      !user.emailOtpExpires ||
      new Date() > new Date(user.emailOtpExpires)
    ) {
      return res.status(400).json({
        success: false,
        message: "Email OTP expired.",
      });
    }

    // ==================================
    // Generate Temporary Password
    // ==================================

    const temporaryPassword =
      "VEN@" +
      Math.random().toString(36).slice(-6) +
      Math.floor(100 + Math.random() * 900);

    console.log("Temporary Password:", temporaryPassword);

    // ==========================
    // Hash Password
    // ==========================

    const hashedPassword = await bcrypt.hash(
      temporaryPassword,
      12
    );

    // ==========================
    // Update User
    // ==========================

    await user.update({
      password: hashedPassword,

      isEmailVerified: true,

      emailOtp: null,
      emailOtpExpires: null,
      emailOtpAttempts: 0,

      emailVerifiedAt: new Date(),
    });

    // ==========================
    // Update Vendor
    // ==========================

    await vendor.update({
      status: "Approved",
      isVerified: true,
    });

    // ==================================
    // Send Temporary Password by Email
    // ==================================

    await sendTemporaryPassword(
      user.email,
      temporaryPassword
    );

    // ==========================
    // Generate JWT
    // ==========================

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
    );

    // ==========================
    // Response
    // ==========================

    return res.status(200).json({
      success: true,

      message:
        "Vendor verified successfully. Temporary password has been sent to your registered email.",

      token,

      vendor: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Verify Vendor Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};



exports.vendorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ==========================
    // Validate Input
    // ==========================
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // ==========================
    // Find Vendor User
    // ==========================
    const user = await User.findOne({
      where: {
        email,
        role: "Vendor",
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found.",
      });
    }

    // ==========================
    // Email Verification
    // ==========================
    if (!user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Vendor account is not verified.",
      });
    }

    // ==========================
    // Find Vendor Details
    // ==========================
    const vendor = await Vendor.findOne({
      where: {
        userId: user.id,
      },
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor details not found.",
      });
    }

    // ==========================
    // Vendor Status
    // ==========================
    if (vendor.status !== "Approved") {
      return res.status(400).json({
        success: false,
        message: "Vendor account is not approved.",
      });
    }

    // ==========================
    // Check Password
    // ==========================
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "Vendor password has not been generated.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ==========================
    // Update Last Login
    // ==========================
    await user.update({
      lastLogin: new Date(),
    });

    // ==========================
    // Generate JWT
    // ==========================
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
    );

    // ==========================
    // Success Response
    // ==========================
    return res.status(200).json({
      success: true,
      message: "Vendor login successful.",
      token,

      vendor: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        vendorId: vendor.id,
        vendorName: vendor.vendorName,
        shopName: vendor.shopName,
        status: vendor.status,
      },
    });

  } catch (error) {
    console.error("Vendor Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
