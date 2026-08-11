const { body } = require("express-validator");

// ========================================
// CREATE HOME VALIDATION
// ========================================

exports.createHomeValidation = [
  body("productName")
    .notEmpty()
    .withMessage("Product name is required"),

  body("category")
    .notEmpty()
    .withMessage("Category is required"),

  body("subCategory")
    .notEmpty()
    .withMessage("Sub category is required"),

  body("productDescription")
    .notEmpty()
    .withMessage("Product description is required"),

  body("mrp")
    .isFloat({ min: 0 })
    .withMessage("MRP must be a valid positive number"),

  body("sellingPrice")
    .isFloat({ min: 0 })
    .withMessage("Selling price must be a valid positive number"),

  body("stock")
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
// UPDATE HOME VALIDATION
// ========================================

exports.updateHomeValidation = [
  body("productName")
    .optional()
    .notEmpty()
    .withMessage("Product name cannot be empty"),

  body("mrp")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("MRP must be a valid positive number"),

  body("sellingPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Selling price must be a valid positive number"),

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