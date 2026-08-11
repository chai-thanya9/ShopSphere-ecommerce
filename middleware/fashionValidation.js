const { body, param } = require("express-validator");

// ========================================
// CREATE FASHION VALIDATION
// ========================================

exports.createFashionValidation = [
  body("productName")
    .trim()
    .notEmpty()
    .withMessage("Product name is required"),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isIn(["Men", "Women", "Kids", "Unisex"])
    .withMessage("Invalid category"),

  body("subCategory")
    .trim()
    .notEmpty()
    .withMessage("Sub category is required"),

  body("productDescription")
    .trim()
    .notEmpty()
    .withMessage("Product description is required"),

  body("brandName")
    .optional()
    .trim(),

  body("material")
    .optional()
    .trim(),

  body("fabric")
    .optional()
    .trim(),

  body("pattern")
    .optional()
    .trim(),

  body("fitType")
    .optional()
    .isIn([
      "Regular",
      "Slim",
      "Relaxed",
      "Oversized",
      "Loose",
    ])
    .withMessage("Invalid fit type"),

  body("occasion")
    .optional()
    .trim(),

  body("mrp")
    .notEmpty()
    .withMessage("MRP is required")
    .isFloat({ min: 0.01 })
    .withMessage("MRP must be greater than 0"),

  body("sellingPrice")
    .notEmpty()
    .withMessage("Selling price is required")
    .isFloat({ min: 0.01 })
    .withMessage("Selling price must be greater than 0"),

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
// UPDATE FASHION VALIDATION
// ========================================

exports.updateFashionValidation = [
  param("id")
    .isUUID()
    .withMessage("Invalid fashion product ID"),

  body("productName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Product name cannot be empty"),

  body("category")
    .optional()
    .isIn(["Men", "Women", "Kids", "Unisex"])
    .withMessage("Invalid category"),

  body("fitType")
    .optional()
    .isIn([
      "Regular",
      "Slim",
      "Relaxed",
      "Oversized",
      "Loose",
    ])
    .withMessage("Invalid fit type"),

  body("mrp")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage("MRP must be greater than 0"),

  body("sellingPrice")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage("Selling price must be greater than 0"),

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