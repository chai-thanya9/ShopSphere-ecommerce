// controllers/vendorController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const Vendor = require("../models/Vendor");
const sequelize = require("../config/database");
const { generateOTP } = require("../utils/otpGenerator");
const { sendVendorRegistrationEmail,} = require("../utils/sendEmail");


// ========================================
// GENERATE TEMPORARY PASSWORD
// ========================================

const generateTemporaryPassword = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$";

  let password = "";

  for (let i = 0; i < 10; i++) {
    password += characters.charAt(
      Math.floor(
        Math.random() * characters.length
      )
    );
  }

  return password;
};


// ========================================
// CREATE VENDOR
// ADMIN ONLY
// ========================================

exports.createVendor = async (req, res) => {
  let transaction;

  try {
    const {
      vendorName,
      email,
      businessType,
      mobileNumber,
      shopName,
    } = req.body;

    // ========================================
    // REQUIRED FIELDS
    // ========================================

    if (
      !vendorName ||
      !email ||
      !businessType ||
      !mobileNumber ||
      !shopName
    ) {
      return res.status(400).json({
        success: false,
        message:
          "vendorName, email, businessType, mobileNumber and shopName are required",
      });
    }

    // ========================================
    // CHECK EXISTING VENDOR EMAIL
    // ========================================

    const existingVendor = await Vendor.findOne({
      where: {
        email,
      },
    });

    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: "Vendor email already registered",
      });
    }

    // ========================================
    // CHECK EXISTING MOBILE
    // ========================================

    const existingMobile = await Vendor.findOne({
      where: {
        mobileNumber,
      },
    });

    if (existingMobile) {
      return res.status(400).json({
        success: false,
        message: "Vendor mobile number already registered",
      });
    }

    // ========================================
    // GENERATE OTP
    // ========================================

    const emailOtp = generateOTP();

    const emailOtpExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // ========================================
    // GENERATE TEMPORARY PASSWORD
    // ========================================

    const temporaryPassword =
      generateTemporaryPassword();

    // ========================================
    // HASH PASSWORD
    // ========================================

    const hashedPassword = await bcrypt.hash(
      temporaryPassword,
      10
    );

    // ========================================
    // START TRANSACTION
    // ========================================

    transaction = await sequelize.transaction();

    // ========================================
    // CREATE VENDOR
    // ========================================

    const vendor = await Vendor.create(
      {
        vendorName,

        role: "Vendor",

        email,

        mobileNumber,

        password: hashedPassword,

        emailOtp,

        emailOtpExpires,

        isEmailVerified: false,

        businessType,

        shopName,

        status: "Pending",

        isVerified: false,
      },
      {
        transaction,
      }
    );

    // ========================================
    // COMMIT TRANSACTION
    // ========================================

    await transaction.commit();

    transaction = null;

    console.log(
      "Vendor created successfully:",
      vendor.email
    );

    // ========================================
    // SEND REGISTRATION EMAIL
    // ========================================

    try {
      await sendVendorRegistrationEmail({
        email: vendor.email,

        vendorName: vendor.vendorName,

        businessType:
          vendor.businessType,

        shopName:
          vendor.shopName,

        mobileNumber:
          vendor.mobileNumber,

        otp: emailOtp,

        temporaryPassword,
      });

      console.log(
        "Vendor registration email sent:",
        vendor.email
      );

    } catch (emailError) {

      console.error(
        "Vendor Email Error:",
        emailError
      );

      return res.status(201).json({
        success: true,

        message:
          "Vendor created successfully, but registration email could not be sent.",

        data: {
          vendorId: vendor.id,

          vendorName:
            vendor.vendorName,

          role:
            vendor.role,

          email:
            vendor.email,

          mobileNumber:
            vendor.mobileNumber,

          businessType:
            vendor.businessType,

          shopName:
            vendor.shopName,

          status:
            vendor.status,

          isVerified:
            vendor.isVerified,
        },
      });
    }

    // ========================================
    // SUCCESS RESPONSE
    // ========================================

    return res.status(201).json({
      success: true,

      message:
        "Vendor registration completed successfully. OTP and temporary password sent to vendor email.",

      data: {
        vendorId:
          vendor.id,

        vendorName:
          vendor.vendorName,

        role:
          vendor.role,

        email:
          vendor.email,

        mobileNumber:
          vendor.mobileNumber,

        businessType:
          vendor.businessType,

        shopName:
          vendor.shopName,

        status:
          vendor.status,

        isVerified:
          vendor.isVerified,

        isEmailVerified:
          vendor.isEmailVerified,
      },
    });

  } catch (error) {

    // ========================================
    // ROLLBACK
    // ========================================

    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error(
          "Rollback Error:",
          rollbackError
        );
      }
    }

    console.error(
      "Create Vendor Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Vendor creation failed",
      error: error.message,
    });
  }
};

// ========================================
// VERIFY VENDOR
// ========================================

exports.verifyVendor = async (req, res) => {
  try {
    const { email, emailOtp } = req.body;

    // ========================================
    // VALIDATE INPUT
    // ========================================

    if (!email || !emailOtp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // ========================================
    // FIND VENDOR
    // Table: vendors
    // Role: Vendor
    // ========================================

    const vendor = await Vendor.findOne({
      where: {
        email: email,
        role: "Vendor",
      },
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    // ========================================
    // CHECK ALREADY VERIFIED
    // ========================================

    if (vendor.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Vendor email is already verified",
      });
    }

    // ========================================
    // CHECK OTP EXISTS
    // ========================================

    if (!vendor.emailOtp) {
      return res.status(400).json({
        success: false,
        message:
          "OTP not found. Please request a new OTP",
      });
    }

    // ========================================
    // CHECK OTP EXPIRATION
    // ========================================

    if (
      !vendor.emailOtpExpires ||
      new Date() > new Date(vendor.emailOtpExpires)
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // ========================================
    // COMPARE OTP
    // ========================================

    if (
      String(vendor.emailOtp) !==
      String(emailOtp)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // ========================================
    // VERIFY VENDOR
    // ========================================

    vendor.isEmailVerified = true;
    vendor.isVerified = true;

    vendor.status = "Approved";

    vendor.emailVerifiedAt = new Date();

    // ========================================
    // CLEAR OTP
    // ========================================

    vendor.emailOtp = null;
    vendor.emailOtpExpires = null;

    // ========================================
    // SAVE VENDOR
    // ========================================

    await vendor.save();

    // ========================================
    // SUCCESS RESPONSE
    // ========================================

    return res.status(200).json({
      success: true,
      message: "Vendor email verified successfully",

      data: {
        vendorId: vendor.id,
        vendorName: vendor.vendorName,
        email: vendor.email,
        role: vendor.role,
        businessType: vendor.businessType,
        shopName: vendor.shopName,
        status: vendor.status,
        isEmailVerified: vendor.isEmailVerified,
        isVerified: vendor.isVerified,
        emailVerifiedAt: vendor.emailVerifiedAt,
      },
    });

  } catch (error) {
    console.error(
      "Verify Vendor Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Vendor verification failed",
      error: error.message,
    });
  }
};


// ========================================
// VENDOR LOGIN
// ========================================

exports.vendorLogin = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // ========================================
    // VALIDATE INPUT
    // ========================================

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // ========================================
    // FIND VENDOR
    // ========================================

    const vendor = await Vendor.findOne({
      where: {
        email: email.trim(),
        role: "Vendor",
      },
    });

    console.log("LOGIN EMAIL:", email);
    console.log("VENDOR FOUND:", vendor);

    // ========================================
    // VENDOR NOT FOUND
    // ========================================

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    // ========================================
    // CHECK EMAIL VERIFICATION
    // ========================================

    if (!vendor.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your email before login",
      });
    }

    // ========================================
    // CHECK VENDOR VERIFICATION
    // ========================================

    if (!vendor.isVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Vendor account is not verified",
      });
    }

    // ========================================
    // CHECK STATUS
    // ========================================

    if (vendor.status === "Blocked") {
      return res.status(403).json({
        success: false,
        message:
          "Vendor account is blocked",
      });
    }

    if (vendor.status === "Rejected") {
      return res.status(403).json({
        success: false,
        message:
          "Vendor account has been rejected",
      });
    }

    if (vendor.status === "Pending") {
      return res.status(403).json({
        success: false,
        message:
          "Vendor account is pending approval",
      });
    }

    // ========================================
    // CHECK PASSWORD
    // ========================================

    const passwordMatch =
      await bcrypt.compare(
        password,
        vendor.password
      ); 

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // ========================================
    // GENERATE JWT
    // ========================================

    const token = jwt.sign(
      {
        id: vendor.id,
        vendorId: vendor.id,
        email: vendor.email,
        role: vendor.role,
      },
      process.env.JWT_SECRET
    );

    // ========================================
    // SUCCESS
    // ========================================

    return res.status(200).json({
      success: true,

      message:
        "Vendor login successful",

      token,

      data: {
        vendorId: vendor.id,
        vendorName: vendor.vendorName,
        email: vendor.email,
        businessType: vendor.businessType,
        shopName: vendor.shopName,
        role: vendor.role,
        status: vendor.status,
        isVerified: vendor.isVerified,
        isEmailVerified:
          vendor.isEmailVerified,
      },
    });

  } catch (error) {

    console.error(
      "Vendor Login Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Vendor login failed",
      error:
        error.message,
    });
  }
};


// ========================================
// GET ALL VENDORS
// ADMIN ONLY
// ========================================

exports.getAllVendors = async (req, res) => {
  try {

    const vendors =
      await Vendor.findAll({
        include: [
          {
            model: User,

            as: "user",

            attributes: [
              "id",
              "firstName",
              "lastName",
              "email",
              "mobileNumber",
              "role",
              "isEmailVerified",
              "lastLogin",
            ],
          },
        ],

        order: [
          ["createdAt", "DESC"],
        ],
      });


    return res.status(200).json({
      success: true,

      count: vendors.length,

      data: vendors,
    });

  } catch (error) {

    console.error(
      "Get All Vendors Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


// ========================================
// GET VENDOR BY ID
// ADMIN ONLY
// ========================================

exports.getVendorById = async (req, res) => {
  try {

    const vendor =
      await Vendor.findOne({
        where: {
          id: req.params.id,
        },

        include: [
          {
            model: User,

            as: "user",

            attributes: [
              "id",
              "firstName",
              "lastName",
              "email",
              "mobileNumber",
              "role",
              "isEmailVerified",
              "lastLogin",
            ],
          },
        ],
      });


    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }


    return res.status(200).json({
      success: true,
      data: vendor,
    });

  } catch (error) {

    console.error(
      "Get Vendor By ID Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


// ========================================
// UPDATE VENDOR
// ADMIN ONLY
// ========================================

exports.updateVendor = async (req, res) => {
  try {

    const {
      firstName,
      lastName,
      email,
      mobileNumber,
      vendorName,
      businessType,
      shopName,
      status,
    } = req.body;


    // ========================================
    // FIND VENDOR
    // ========================================

    const vendor =
      await Vendor.findByPk(
        req.params.id
      );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }


    // ========================================
    // FIND USER
    // ========================================

    const user =
      await User.findByPk(
        vendor.userId
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Vendor user not found",
      });
    }


    // ========================================
    // UPDATE USER
    // ========================================

    if (firstName !== undefined)
      user.firstName = firstName;

    if (lastName !== undefined)
      user.lastName = lastName;

    if (email !== undefined)
      user.email = email;

    if (mobileNumber !== undefined)
      user.mobileNumber =
        mobileNumber;


    await user.save();


    // ========================================
    // UPDATE VENDOR
    // ========================================

    if (vendorName !== undefined)
      vendor.vendorName =
        vendorName;

    if (businessType !== undefined)
      vendor.businessType =
        businessType;

    if (shopName !== undefined)
      vendor.shopName =
        shopName;

    if (status !== undefined)
      vendor.status = status;


    await vendor.save();


    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({
      success: true,

      message:
        "Vendor updated successfully",

      data: {
        user,
        vendor,
      },
    });

  } catch (error) {

    console.error(
      "Update Vendor Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Vendor update failed",
      error: error.message,
    });
  }
};


// ========================================
// DELETE VENDOR
// ADMIN ONLY
// ========================================

exports.deleteVendor = async (req, res) => {
  try {

    const vendor =
      await Vendor.findByPk(
        req.params.id
      );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }


    // ========================================
    // DELETE USER
    // ========================================

    const user =
      await User.findByPk(
        vendor.userId
      );


    // ========================================
    // DELETE VENDOR
    // ========================================

    await vendor.destroy();


    // ========================================
    // DELETE USER
    // ========================================

    if (user) {
      await user.destroy();
    }


    return res.status(200).json({
      success: true,

      message:
        "Vendor deleted successfully",
    });

  } catch (error) {

    console.error(
      "Delete Vendor Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Vendor deletion failed",
      error: error.message,
    });
  }
};