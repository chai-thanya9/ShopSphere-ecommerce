const { body } = require("express-validator");

// ========================================
// CREATE FURNITURE VALIDATION
// ========================================

exports.createFurnitureValidation = [
  body("productName")
    .trim()
    .notEmpty()
    .withMessage("Product name is required"),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn([
      "Sofa",
      "Bed",
      "Table",
      "Chair",
      "Wardrobe",
      "Cabinet",
      "Bookshelf",
      "Dining Set",
      "Office Furniture",
      "TV Unit",
      "Shoe Rack",
      "Storage",
      "Other",
    ])
    .withMessage("Invalid furniture category"),

  body("productDescription")
    .trim()
    .notEmpty()
    .withMessage(
      "Product description is required"
    ),

  body("brandName")
    .optional()
    .trim(),

  body("material")
    .optional()
    .trim(),

  body("color")
    .optional()
    .trim(),

  body("finishType")
    .optional()
    .trim(),

  body("seatingCapacity")
    .optional()
    .isInt({ min: 1 })
    .withMessage(
      "Seating capacity must be a positive number"
    ),

  body("lengthCm")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "Length must be a positive number"
    ),

  body("widthCm")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "Width must be a positive number"
    ),

  body("heightCm")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "Height must be a positive number"
    ),

  body("mrp")
    .notEmpty()
    .withMessage("MRP is required")
    .isFloat({ min: 0 })
    .withMessage(
      "MRP must be a positive number"
    ),

  body("sellingPrice")
    .notEmpty()
    .withMessage("Selling price is required")
    .isFloat({ min: 0 })
    .withMessage(
      "Selling price must be a positive number"
    ),

  body("discountPercentage")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage(
      "Discount must be between 0 and 100"
    ),

  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage(
      "Stock cannot be negative"
    ),

  body("lowStockLimit")
    .optional()
    .isInt({ min: 0 })
    .withMessage(
      "Low stock limit cannot be negative"
    ),

  body("criticalStockLimit")
    .optional()
    .isInt({ min: 0 })
    .withMessage(
      "Critical stock limit cannot be negative"
    ),

  body("status")
    .optional()
    .isIn([
      "Draft",
      "Pending",
      "Approved",
      "Rejected",
      "Blocked",
    ])
    .withMessage("Invalid product status"),
];

// ========================================
// UPDATE FURNITURE VALIDATION
// ========================================

exports.updateFurnitureValidation = [
  body("productName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Product name cannot be empty"),

  body("category")
    .optional()
    .isIn([
      "Sofa",
      "Bed",
      "Table",
      "Chair",
      "Wardrobe",
      "Cabinet",
      "Bookshelf",
      "Dining Set",
      "Office Furniture",
      "TV Unit",
      "Shoe Rack",
      "Storage",
      "Other",
    ])
    .withMessage("Invalid furniture category"),

  body("productDescription")
    .optional()
    .trim()
    .notEmpty()
    .withMessage(
      "Product description cannot be empty"
    ),

  body("seatingCapacity")
    .optional()
    .isInt({ min: 1 })
    .withMessage(
      "Seating capacity must be a positive number"
    ),

  body("lengthCm")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "Length cannot be negative"
    ),

  body("widthCm")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "Width cannot be negative"
    ),

  body("heightCm")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "Height cannot be negative"
    ),

  body("mrp")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "MRP cannot be negative"
    ),

  body("sellingPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "Selling price cannot be negative"
    ),

  body("discountPercentage")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage(
      "Discount must be between 0 and 100"
    ),

  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage(
      "Stock cannot be negative"
    ),

  body("lowStockLimit")
    .optional()
    .isInt({ min: 0 })
    .withMessage(
      "Low stock limit cannot be negative"
    ),

  body("criticalStockLimit")
    .optional()
    .isInt({ min: 0 })
    .withMessage(
      "Critical stock limit cannot be negative"
    ),

  body("status")
    .optional()
    .isIn([
      "Draft",
      "Pending",
      "Approved",
      "Rejected",
      "Blocked",
    ])
    .withMessage("Invalid product status"),
];