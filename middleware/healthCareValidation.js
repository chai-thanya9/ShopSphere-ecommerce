const { body } = require("express-validator");

// ========================================
// CREATE HEALTH CARE
// ========================================

exports.createHealthCareValidation = [
  body("productName")
    .trim()
    .notEmpty()
    .withMessage("Product name is required"),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required"),

  body("subCategory")
    .optional()
    .trim(),

  body("productDescription")
    .optional()
    .trim(),

  body("brandName")
    .optional()
    .trim(),

  body("manufacturer")
    .optional()
    .trim(),

  body("expiryDate")
    .optional()
    .isISO8601()
    .withMessage("Expiry date must be a valid date"),

  body("mrp")
    .notEmpty()
    .withMessage("MRP is required")
    .isFloat({ min: 0 })
    .withMessage("MRP must be a positive number"),

  body("sellingPrice")
    .notEmpty()
    .withMessage("Selling price is required")
    .isFloat({ min: 0 })
    .withMessage("Selling price must be a positive number"),

  body("discountPercentage")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount must be between 0 and 100"),

  body("stock")
    .notEmpty()
    .withMessage("Stock is required")
    .isInt({ min: 0 })
    .withMessage("Stock cannot be negative"),

  body("lowStockLimit")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Low stock limit cannot be negative"),

  body("criticalStockLimit")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Critical stock limit cannot be negative"),
];

// ========================================
// UPDATE HEALTH CARE
// ========================================

exports.updateHealthCareValidation = [
  body("productName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Product name cannot be empty"),

  body("category")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Category cannot be empty"),

  body("expiryDate")
    .optional()
    .isISO8601()
    .withMessage("Expiry date must be a valid date"),

  body("mrp")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("MRP cannot be negative"),

  body("sellingPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Selling price cannot be negative"),

  body("discountPercentage")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount must be between 0 and 100"),

  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock cannot be negative"),

  body("lowStockLimit")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Low stock limit cannot be negative"),

  body("criticalStockLimit")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Critical stock limit cannot be negative"),
];