const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Vendor = sequelize.define(
  "Vendor",
  {
    // ========================================
    // VENDOR ID
    // ========================================

    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },



    vendorName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Vendor",
    },


    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    // ========================================
    // PASSWORD
    // ========================================

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // ========================================
    // EMAIL OTP
    // ========================================

    emailOtp: {
      type: DataTypes.STRING(6),
      allowNull: true,
    },

    emailOtpExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // ========================================
    // BUSINESS TYPE
    // ========================================

    businessType: {
      type: DataTypes.ENUM(
        "Fashion",
        "Electronics",
        "Beauty",
        "Home",
        "Appliances",
        "Furniture",
        "Books",
        "Sports",
        "Health Care",
        "Groceries",
        "Toys",
        "Stationery",
        "Musical Instruments",
        "Arts & Crafts",
        "Mobiles",
        "Others"
      ),
      allowNull: false,
    },

    // ========================================
    // SHOP
    // ========================================

    shopName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    mobileNumber: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true,
    },

    // ========================================
    // VENDOR STATUS
    // ========================================

    status: {
      type: DataTypes.ENUM(
        "Pending",
        "Approved",
        "Rejected",
        "Blocked"
      ),
      defaultValue: "Pending",
    },

    // ========================================
    // VERIFICATION
    // ========================================

    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    emailVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },

  {
    tableName: "vendors",
    timestamps: true,
  }
);

module.exports = Vendor;