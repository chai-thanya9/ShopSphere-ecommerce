// models/Toys.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Toys = sequelize.define(
  "Toys",
  {
    // ========================================
    // PRIMARY KEY
    // ========================================

    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // ========================================
    // VENDOR
    // ========================================

    vendorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "vendors",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    // ========================================
    // PRODUCT INFORMATION
    // ========================================

    productName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    brandName: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    category: {
      type: DataTypes.ENUM(
        "Action Figures",
        "Dolls",
        "Remote Control",
        "Educational",
        "Building Blocks",
        "Board Games",
        "Puzzles",
        "Soft Toys",
        "Outdoor Toys",
        "Baby Toys",
        "Vehicles",
        "Musical Toys",
        "Pretend Play",
        "Arts & Crafts",
        "STEM Toys",
        "Other"
      ),
      allowNull: false,
    },

    subCategory: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    productDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // ========================================
    // AGE GROUP
    // ========================================

    ageGroup: {
      type: DataTypes.ENUM(
        "0-3 Months",
        "3-6 Months",
        "6-12 Months",
        "1-2 Years",
        "2-4 Years",
        "4-6 Years",
        "6-8 Years",
        "8-12 Years",
        "12+ Years"
      ),
      allowNull: true,
    },

    // ========================================
    // GENDER
    // ========================================

    gender: {
      type: DataTypes.ENUM(
        "Boys",
        "Girls",
        "Unisex"
      ),
      defaultValue: "Unisex",
    },

    // ========================================
    // MATERIAL
    // ========================================

    material: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // ========================================
    // PRICE
    // ========================================

    mrp: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    sellingPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    discountPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },

    // ========================================
    // INVENTORY
    // ========================================

    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    lowStockLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 20,
    },

    criticalStockLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },

    stockStatus: {
      type: DataTypes.ENUM(
        "In Stock",
        "Low Stock",
        "Critical Stock",
        "Out of Stock"
      ),
      defaultValue: "In Stock",
    },

    // ========================================
    // IMAGES
    // ========================================

    imageUrls: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
      defaultValue: [],
    },

    cloudinaryPublicIds: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },

    // ========================================
    // PRODUCT STATUS
    // ========================================

    status: {
      type: DataTypes.ENUM(
        "Draft",
        "Pending",
        "Approved",
        "Rejected",
        "Blocked"
      ),
      allowNull: false,
      defaultValue: "Pending",
    },

    // ========================================
    // RATINGS
    // ========================================

    averageRating: {
      type: DataTypes.DECIMAL(2, 1),
      defaultValue: 0,
    },

    totalReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "toy_products",
    timestamps: true,
  }
);

module.exports = Toys;