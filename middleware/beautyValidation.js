const { body } = require("express-validator");

// ========================================
// CREATE BEAUTY VALIDATION
// ========================================

exports.createBeautyValidation = [
  body("productName")
    .trim()
    .notEmpty()
    .withMessage("Product name is required"),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn([
      "Makeup",
      "Skincare",
      "Hair Care",
      "Fragrance",
      "Bath & Body",
      "Personal Care",
      "Beauty Tools",
      "Men's Grooming",
      "Others",
    ])
    .withMessage("Invalid beauty category"),

  body("subCategory")
    .trim()
    .notEmpty()
    .withMessage("Sub category is required"),

  body("productDescription")
    .trim()
    .notEmpty()
    .withMessage("Product description is required"),

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
// UPDATE BEAUTY VALIDATION
// ========================================

exports.updateBeautyValidation = [
  body("productName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Product name cannot be empty"),

  body("category")
    .optional()
    .isIn([
      "Makeup",
      "Skincare",
      "Hair Care",
      "Fragrance",
      "Bath & Body",
      "Personal Care",
      "Beauty Tools",
      "Men's Grooming",
      "Others",
    ])
    .withMessage("Invalid beauty category"),

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