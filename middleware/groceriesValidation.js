const { body } = require("express-validator");

// ========================================
// CREATE GROCERY VALIDATION
// ========================================

exports.createGroceriesValidation = [
  body("productName")
    .notEmpty()
    .withMessage("Product name is required"),

  body("category")
    .notEmpty()
    .withMessage("Category is required"),

  body("unit")
    .notEmpty()
    .withMessage("Unit is required"),

  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required"),

  body("mrp")
    .notEmpty()
    .withMessage("MRP is required"),

  body("sellingPrice")
    .notEmpty()
    .withMessage("Selling price is required"),

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

// ========================================
// UPDATE GROCERY VALIDATION
// ========================================

exports.updateGroceriesValidation = [
  body("productName")
    .optional()
    .notEmpty()
    .withMessage("Product name cannot be empty"),

  body("quantity")
    .optional()
    .notEmpty()
    .withMessage("Quantity cannot be empty"),

  body("mrp")
    .optional()
    .notEmpty()
    .withMessage("MRP cannot be empty"),

  body("sellingPrice")
    .optional()
    .notEmpty()
    .withMessage("Selling price cannot be empty"),

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