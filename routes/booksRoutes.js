const express = require("express");
const router = express.Router();

const {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
} = require("../controllers/booksController");

const {
  createBookValidation,
} = require("../middleware/booksValidation");

const validateRequest = require("../middleware/validationResult");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploads");

// CREATE
router.post(
  "/create",
  authenticate,
  authorize("Vendor"),
  upload.array("coverImages", 10),
  createBookValidation,
  validateRequest,
  createBook
);

// GET ALL
router.get(
  "/",
//   authenticate,
//   authorize("Vendor"),
  getAllBooks
);

// GET ONE
router.get(
  "/:id",
//   authenticate,
//   authorize("Vendor"),
  getBookById
);

// UPDATE
router.put(
  "/:id",
  authenticate,
  authorize("Vendor"),
  upload.array("coverImages", 10),
  updateBook
);

// ========================================
// UPDATE BOOK - PATCH
// ========================================

router.patch(
  "/:id",
//   authenticate,
//   authorize("Vendor"),
  upload.array("coverImages", 10),
  updateBook
);

// DELETE
router.delete(
  "/:id",
  authenticate,
  authorize("Vendor"),
  deleteBook
);

module.exports = router;