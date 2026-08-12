// middleware/musicalInstrumentsValidation.js

const { body } = require("express-validator");

// ========================================
// CREATE VALIDATION
// ========================================

exports.createMusicalInstrumentValidation = [
  body("productName")
    .notEmpty()
    .withMessage("Product name is required"),

  body("category")
    .notEmpty()
    .withMessage("Category is required"),

  body("mrp")
    .notEmpty()
    .withMessage("MRP is required")
    .isFloat({ min: 0 })
    .withMessage("MRP cannot be negative"),

  body("sellingPrice")
    .notEmpty()
    .withMessage("Selling price is required")
    .isFloat({ min: 0 })
    .withMessage(
      "Selling price cannot be negative"
    ),

  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock cannot be negative"),

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

  body("discountPercentage")
    .optional()
    .isFloat({
      min: 0,
      max: 100,
    })
    .withMessage(
      "Discount percentage must be between 0 and 100"
    ),
];

// ========================================
// UPDATE / PATCH VALIDATION
// ========================================

exports.updateMusicalInstrumentValidation = [
  body("productName")
    .optional()
    .notEmpty()
    .withMessage(
      "Product name cannot be empty"
    ),

  body("mrp")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("MRP cannot be negative"),

  body("sellingPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "Selling price cannot be negative"
    ),

  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock cannot be negative"),

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

  body("discountPercentage")
    .optional()
    .isFloat({
      min: 0,
      max: 100,
    })
    .withMessage(
      "Discount percentage must be between 0 and 100"
    ),
];