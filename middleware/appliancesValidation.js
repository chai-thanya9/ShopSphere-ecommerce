const { body } = require("express-validator");

// ========================================
// CREATE APPLIANCE VALIDATION
// ========================================

exports.createAppliancesValidation = [

  body("productName")
    .trim()
    .notEmpty()
    .withMessage("Product name is required"),

  body("brandName")
    .trim()
    .notEmpty()
    .withMessage("Brand name is required"),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isIn([
      "Kitchen Appliances",
      "Home Appliances",
      "Cleaning Appliances",
      "Cooling Appliances",
      "Heating Appliances",
      "Personal Care Appliances",
      "Other",
    ])
    .withMessage("Invalid appliance category"),

  body("subCategory")
    .trim()
    .notEmpty()
    .withMessage("Sub category is required"),

  body("productDescription")
    .trim()
    .notEmpty()
    .withMessage("Product description is required"),

  body("mrp")
    .trim()
    .notEmpty()
    .withMessage("MRP is required")
    .isFloat({ min: 0 })
    .withMessage("MRP must be a valid positive number"),

  body("sellingPrice")
    .trim()
    .notEmpty()
    .withMessage("Selling price is required")
    .isFloat({ min: 0 })
    .withMessage("Selling price must be a valid positive number"),

  body("discountPercentage")
    .optional({ values: "falsy" })
    .trim()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount must be between 0 and 100"),

  body("stock")
    .trim()
    .notEmpty()
    .withMessage("Stock is required")
    .isInt({ min: 0 })
    .withMessage("Stock cannot be negative"),

  body("lowStockLimit")
    .optional({ values: "falsy" })
    .trim()
    .isInt({ min: 0 })
    .withMessage("Low stock limit cannot be negative"),

  body("criticalStockLimit")
    .optional({ values: "falsy" })
    .trim()
    .isInt({ min: 0 })
    .withMessage("Critical stock limit cannot be negative"),
];

// ========================================
// UPDATE APPLIANCE VALIDATION
// ========================================

exports.updateAppliancesValidation = [
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
      "Kitchen Appliances",
      "Home Appliances",
      "Cleaning Appliances",
      "Cooling Appliances",
      "Heating Appliances",
      "Personal Care Appliances",
      "Other",
    ])
    .withMessage("Invalid appliance category"),

  body("subCategory")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Sub category cannot be empty"),

  body("productDescription")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Product description cannot be empty"),

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

exports.validateAppliancesBulkUpload = (
  req,
  res,
  next
) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message:
        "CSV or Excel file is required",
    });
  }

  const allowedTypes = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  const allowedExtensions = [
    ".csv",
    ".xls",
    ".xlsx",
  ];

  const fileName =
    req.file.originalname.toLowerCase();

  const hasValidExtension =
    allowedExtensions.some((extension) =>
      fileName.endsWith(extension)
    );

  if (!hasValidExtension) {
    return res.status(400).json({
      success: false,
      message:
        "Only CSV, XLS or XLSX files are allowed",
    });
  }

  next();
};