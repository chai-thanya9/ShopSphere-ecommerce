const { body } = require("express-validator");

// ========================================
// CREATE VALIDATION
// ========================================

exports.createElectronicsValidation = [
  body("productName")
    .trim()
    .notEmpty()
    .withMessage("Product name is required"),

  body("brandName")
    .trim()
    .notEmpty()
    .withMessage("Brand name is required"),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn([
      "Mobiles",
      "Laptops",
      "Tablets",
      "Televisions",
      "Audio",
      "Cameras",
      "Headphones",
      "Smart Watches",
      "Computer Accessories",
      "Mobile Accessories",
      "Home Appliances",
      "Gaming",
      "Other",
    ])
    .withMessage("Invalid electronics category"),

  body("modelNumber")
    .optional()
    .trim(),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required"),

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
    .withMessage(
      "Discount must be between 0 and 100"
    ),

  body("stock")
    .notEmpty()
    .withMessage("Stock is required")
    .isInt({ min: 0 })
    .withMessage("Stock cannot be negative"),
];

// ========================================
// PATCH / UPDATE VALIDATION
// ========================================

exports.updateElectronicsValidation = [
  body("productName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Product name cannot be empty"),

  body("brandName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Brand name cannot be empty"),

  body("category")
    .optional()
    .isIn([
      "Mobiles",
      "Laptops",
      "Tablets",
      "Televisions",
      "Audio",
      "Cameras",
      "Headphones",
      "Smart Watches",
      "Computer Accessories",
      "Mobile Accessories",
      "Home Appliances",
      "Gaming",
      "Other",
    ])
    .withMessage("Invalid electronics category"),

  body("description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Description cannot be empty"),

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

  body("discountPercentage")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage(
      "Discount must be between 0 and 100"
    ),

  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock cannot be negative"),
];