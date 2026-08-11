// models/Fashion.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Fashion = sequelize.define(
  "Fashion",
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
        "Men",
        "Women",
        "Kids",
        "Unisex"
      ),
      allowNull: false,
    },

    subCategory: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    productDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    // ========================================
    // PRODUCT DETAILS
    // ========================================

    material: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    fabric: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    pattern: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    fitType: {
      type: DataTypes.ENUM(
        "Regular",
        "Slim",
        "Relaxed",
        "Oversized",
        "Loose"
      ),
      allowNull: true,
    },

    occasion: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // ========================================
    // SIZE
    // ========================================

    sizes: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },

    // ========================================
    // SIZE CHART
    // Measurements are stored in cm and mm
    // ========================================

    sizeChart: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },

    // ========================================
    // COLORS
    // ========================================

    colors: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
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
      defaultValue: 10,
    },

    criticalStockLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },

    stockStatus: {
      type: DataTypes.STRING,
      defaultValue: "Out of Stock",
    },

    // ========================================
    // MULTIPLE PRODUCT IMAGES
    // ========================================

    imageUrls: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
      defaultValue: [],
    },

    // ========================================
    // CLOUDINARY PUBLIC IDs
    // Used to delete images from Cloudinary
    // ========================================

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
      allowNull: false,
      defaultValue: 0,
    },

    totalReviews: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    // ========================================
    // TABLE OPTIONS
    // ========================================

    tableName: "fashion_products",
    timestamps: true,
  }
);

module.exports = Fashion;