const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Appliances = sequelize.define(
  "Appliances",
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
      allowNull: false,
    },

    category: {
      type: DataTypes.ENUM(
        "Kitchen Appliances",
        "Home Appliances",
        "Cleaning Appliances",
        "Cooling Appliances",
        "Heating Appliances",
        "Personal Care Appliances",
        "Other"
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

    modelNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    color: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    warranty: {
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
      defaultValue: "Out of Stock",
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
    tableName: "appliances",
    timestamps: true,
  }
);

module.exports = Appliances;