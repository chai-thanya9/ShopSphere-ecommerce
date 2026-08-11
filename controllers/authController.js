const bcrypt = require("bcryptjs");
const admin = require("../config/admin");
const generateToken = require("../utils/generateToken");
const User = require("../models/Users");
const jwt = require("jsonwebtoken");
const { generateOTP } = require("../utils/otpGenerator");
const { sendEmailOtp } = require("../utils/sendEmail");

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email !== admin.email) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(admin);

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: admin.id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};




// ========================================
// USER REGISTER
// ========================================

exports.registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      mobileNumber,
      password,
      confirmPassword,
    } = req.body;

    // ========================================
    // CONFIRM PASSWORD
    // ========================================

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password do not match",
      });
    }

    // ========================================
    // CHECK EXISTING EMAIL
    // ========================================

    const existingEmail = await User.findOne({
      where: {
        email,
      },
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // ========================================
    // CHECK EXISTING MOBILE
    // ========================================

    const existingMobile = await User.findOne({
      where: {
        mobileNumber,
      },
    });

    if (existingMobile) {
      return res.status(409).json({
        success: false,
        message: "Mobile number already registered",
      });
    }

    // ========================================
    // HASH PASSWORD
    // ========================================

    const hashedPassword = await bcrypt.hash(password, 10);

    // ========================================
    // GENERATE EMAIL OTP
    // ========================================

    const emailOtp = generateOTP();

    const emailOtpExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // ========================================
    // CREATE USER
    // ========================================

    const user = await User.create({
      firstName,
      lastName,
      email,
      mobileNumber,

      password: hashedPassword,

      // role is NOT sent by frontend
      // Database default = Customer
      role: "Customer",

      emailOtp,
      emailOtpExpires,

      isEmailVerified: false,
    });

    // ========================================
    // SEND EMAIL OTP
    // ========================================

    await sendEmailOtp(
      email,
      emailOtp
    );

    return res.status(201).json({
      success: true,
      message:
        "User registered successfully. Email OTP sent.",
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Register User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// VERIFY EMAIL OTP
// ========================================

exports.verifyEmailOtp = async (req, res) => {
  try {
    const {
      email,
      emailOtp,
    } = req.body;

    // ========================================
    // FIND USER
    // ========================================

    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ========================================
    // CHECK OTP
    // ========================================

    if (user.emailOtp !== emailOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid email OTP",
      });
    }

    // ========================================
    // CHECK OTP EXPIRY
    // ========================================

    if (
      !user.emailOtpExpires ||
      new Date() > new Date(user.emailOtpExpires)
    ) {
      return res.status(400).json({
        success: false,
        message: "Email OTP expired",
      });
    }

    // ========================================
    // VERIFY USER
    // ========================================

    await user.update({
      isEmailVerified: true,
      emailVerifiedAt: new Date(),

      emailOtp: null,
      emailOtpExpires: null,

      emailOtpAttempts: 0,
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verify Email OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// USER LOGIN
// ========================================

exports.loginUser = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // ========================================
    // FIND USER
    // ========================================

    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ========================================
    // CHECK ACTIVE
    // ========================================

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "User account is inactive",
      });
    }

    // ========================================
    // CHECK EMAIL VERIFICATION
    // ========================================

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    // ========================================
    // CHECK PASSWORD
    // ========================================

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ========================================
    // GENERATE JWT
    // ========================================

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // ========================================
    // UPDATE LAST LOGIN
    // ========================================

    await user.update({
      lastLogin: new Date(),
      loginAttempts: 0,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          mobileNumber: user.mobileNumber,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Login User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};