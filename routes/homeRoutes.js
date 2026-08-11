const express = require("express");
const router = express.Router();

const {
  createHome,
  getAllHome,
  getHomeById,
  updateHome,
  deleteHome,
} = require("../controllers/homeController");

const {
  createHomeValidation,
  updateHomeValidation,
} = require("../middleware/homeValidation");

const validateRequest = require("../middleware/validationResult");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const upload = require("../middleware/uploads");

// CREATE
router.post(
  "/create",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  createHomeValidation,
  validateRequest,
  createHome
);

// GET ALL — public
router.get(
  "/",
  getAllHome
);

// GET BY ID — public
router.get(
  "/:id",
  getHomeById
);

// UPDATE
router.put(
  "/:id",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  updateHomeValidation,
  validateRequest,
  updateHome
);

// PATCH
router.patch(
  "/:id",
  authenticate,
  authorize("Vendor"),
  upload.array("images", 10),
  updateHomeValidation,
  validateRequest,
  updateHome
);

// DELETE
router.delete(
  "/:id",
  authenticate,
  authorize("Vendor"),
  deleteHome
);

module.exports = router;