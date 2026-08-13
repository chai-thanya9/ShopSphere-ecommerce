// controllers/vendorController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/Users");
const Vendor = require("../models/Vendor");

const sequelize = require("../config/database");

const { generateOTP } = require("../utils/otpGenerator");

const {
  sendVendorRegistrationEmail,
} = require("../utils/sendEmail");


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
      firstName,
      lastName,
      email,
      mobileNumber,
      vendorName,
      businessType,
      shopName,
      dateOfBirth,
    } = req.body;


    // ========================================
    // REQUIRED FIELDS
    // ========================================

    if (
      !firstName ||
      !lastName ||
      !email ||
      !mobileNumber ||
      !vendorName ||
      !businessType ||
      !shopName
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All required vendor fields are required",
      });
    }


    // ========================================
    // CHECK EMAIL
    // ========================================

    const existingEmail =
      await User.findOne({
        where: {
          email,
        },
      });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message:
          "Email already registered",
      });
    }


    // ========================================
    // CHECK MOBILE
    // ========================================

    const existingMobile =
      await User.findOne({
        where: {
          mobileNumber,
        },
      });

    if (existingMobile) {
      return res.status(400).json({
        success: false,
        message:
          "Mobile number already registered",
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

    const hashedPassword =
      await bcrypt.hash(
        temporaryPassword,
        10
      );


    // ========================================
    // START TRANSACTION
    // ========================================

    transaction =
      await sequelize.transaction();


    // ========================================
    // CREATE USER
    // ========================================

    const user = await User.create(
      {
        firstName,
        lastName,
        email,
        mobileNumber,

        password: hashedPassword,

        role: "Vendor",

        emailOtp,
        emailOtpExpires,

        isEmailVerified: false,
      },
      {
        transaction,
      }
    );


    // ========================================
    // CREATE VENDOR
    // ========================================

    const vendor = await Vendor.create(
      {
        userId: user.id,

        vendorName,

        businessType,

        shopName,

        dateOfBirth:
          dateOfBirth || null,

        status: "Pending",

        isVerified: false,
      },
      {
        transaction,
      }
    );


    // ========================================
    // COMMIT
    // ========================================

    await transaction.commit();

    transaction = null;


    console.log(
      "Vendor created in database:",
      email
    );


    // ========================================
    // SEND EMAIL
    // ========================================

    try {
      await sendVendorRegistrationEmail({
        email,
        vendorName,
        businessType,
        shopName,
        mobileNumber,
        otp: emailOtp,
        temporaryPassword,
      });

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
          userId: user.id,
          vendorId: vendor.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          mobileNumber: user.mobileNumber,
          vendorName: vendor.vendorName,
          businessType: vendor.businessType,
          shopName: vendor.shopName,
          status: vendor.status,
          isVerified: vendor.isVerified,
        },
      });
    }


    // ========================================
    // SUCCESS
    // ========================================

    return res.status(201).json({
      success: true,

      message:
        "Vendor registration completed successfully. OTP and temporary password sent to vendor email.",

      data: {
        userId: user.id,
        vendorId: vendor.id,

        firstName: user.firstName,
        lastName: user.lastName,

        email: user.email,
        mobileNumber: user.mobileNumber,

        vendorName: vendor.vendorName,
        businessType: vendor.businessType,
        shopName: vendor.shopName,

        status: vendor.status,
        isVerified: vendor.isVerified,
      },
    });

  } catch (error) {

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
        role: "Vendor",
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }


    // ========================================
    // CHECK OTP
    // ========================================

    if (
      !user.emailOtp ||
      user.emailOtp !== emailOtp
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }


    // ========================================
    // CHECK OTP EXPIRY
    // ========================================

    if (
      !user.emailOtpExpires ||
      new Date() >
        new Date(user.emailOtpExpires)
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }


    // ========================================
    // UPDATE USER
    // ========================================

    user.isEmailVerified = true;

    user.emailOtp = null;
    user.emailOtpExpires = null;

    await user.save();


    // ========================================
    // FIND VENDOR
    // ========================================

    const vendor = await Vendor.findOne({
      where: {
        userId: user.id,
      },
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor record not found",
      });
    }


    // ========================================
    // UPDATE VENDOR
    // ========================================

    vendor.isVerified = true;

    await vendor.save();


    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({
      success: true,

      message:
        "Vendor verified successfully",

      data: {
        userId: user.id,
        vendorId: vendor.id,
        email: user.email,
        isEmailVerified:
          user.isEmailVerified,
        isVerified:
          vendor.isVerified,
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
    // FIND USER
    // ========================================

    const user = await User.findOne({
      where: {
        email,
        role: "Vendor",
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }


    // ========================================
    // CHECK EMAIL VERIFICATION
    // ========================================

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your email before login",
      });
    }


    // ========================================
    // CHECK PASSWORD
    // ========================================

    const passwordMatch =
      await bcrypt.compare(
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
    // FIND VENDOR
    // ========================================

    const vendor = await Vendor.findOne({
      where: {
        userId: user.id,
      },
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor record not found",
      });
    }


    // ========================================
    // CHECK VENDOR STATUS
    // ========================================

    if (
      vendor.status === "Blocked"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Vendor account is blocked",
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
        vendorId: vendor.id,
      },

      process.env.JWT_SECRET

      // No expiresIn
    );


    // ========================================
    // UPDATE LAST LOGIN
    // ========================================

    user.lastLogin = new Date();

    await user.save();


    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({
      success: true,

      message:
        "Vendor login successful",

      token,

      data: {
        userId: user.id,
        vendorId: vendor.id,

        firstName:
          user.firstName,

        lastName:
          user.lastName,

        email:
          user.email,

        mobileNumber:
          user.mobileNumber,

        vendorName:
          vendor.vendorName,

        businessType:
          vendor.businessType,

        shopName:
          vendor.shopName,

        role:
          user.role,

        status:
          vendor.status,

        isVerified:
          vendor.isVerified,
      },
    });

  } catch (error) {

    console.error(
      "Vendor Login Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Vendor login failed",
      error: error.message,
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
      dateOfBirth,
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

    if (dateOfBirth !== undefined)
      vendor.dateOfBirth =
        dateOfBirth;

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