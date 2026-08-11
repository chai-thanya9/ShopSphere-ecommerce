const { body } = require("express-validator");

exports.createBookValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Book title is required"),

  body("bookType")
    .trim()
    .notEmpty()
    .withMessage("Book type is required"),

  body("authorName")
    .trim()
    .notEmpty()
    .withMessage("Author name is required"),

  body("publisher")
    .trim()
    .notEmpty()
    .withMessage("Publisher is required"),

  body("publicationDate")
    .optional()
    .isISO8601()
    .withMessage("Publication date must be a valid date"),

  body("pages")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Pages must be greater than 0"),

  body("mrp")
    .isFloat({ min: 0.01 })
    .withMessage("MRP must be greater than 0"),

  body("sellingPrice")
    .isFloat({ min: 0.01 })
    .withMessage("Selling price must be greater than 0"),

  body("discountPercentage")
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage("Discount must be between 0 and 100"),

  body("stock")
    .isInt({ min: 0 })
    .withMessage("Stock cannot be negative"),
];