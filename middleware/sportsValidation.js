const { body } = require("express-validator");

// ========================================
// CREATE SPORTS VALIDATION
// ========================================

exports.createSportsValidation = [
  body("productName")
    .trim()
    .notEmpty()
    .withMessage("Product name is required"),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn([
      "Cricket",
      "Football",
      "Badminton",
      "Tennis",
      "Basketball",
      "Volleyball",
      "Hockey",
      "Table Tennis",
      "Swimming",
      "Fitness",
      "Running",
      "Cycling",
      "Outdoor Games",
      "Indoor Games",
      "Sports Accessories",
      "Other",
    ])
    .withMessage("Invalid sports category"),

  body("productDescription")
    .trim()
    .notEmpty()
    .withMessage(
      "Product description is required"
    ),

  body("brandName")
    .optional()
    .trim(),

  body("subCategory")
    .optional()
    .trim(),

  body("material")
    .optional()
    .trim(),

  body("color")
    .optional()
    .trim(),

  body("size")
    .optional()
    .trim(),

  // ========================================
  // PRICE
  // ========================================

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

  // ========================================
  // STOCK
  // ========================================

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

  // ========================================
  // STATUS
  // ========================================

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
// UPDATE SPORTS VALIDATION
// ========================================

exports.updateSportsValidation = [
  body("productName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage(
      "Product name cannot be empty"
    ),

  body("category")
    .optional()
    .isIn([
      "Cricket",
      "Football",
      "Badminton",
      "Tennis",
      "Basketball",
      "Volleyball",
      "Hockey",
      "Table Tennis",
      "Swimming",
      "Fitness",
      "Running",
      "Cycling",
      "Outdoor Games",
      "Indoor Games",
      "Sports Accessories",
      "Other",
    ])
    .withMessage("Invalid sports category"),

  body("productDescription")
    .optional()
    .trim()
    .notEmpty()
    .withMessage(
      "Product description cannot be empty"
    ),

  body("brandName")
    .optional()
    .trim(),

  body("subCategory")
    .optional()
    .trim(),

  body("material")
    .optional()
    .trim(),

  body("color")
    .optional()
    .trim(),

  body("size")
    .optional()
    .trim(),

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