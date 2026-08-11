const express = require("express");

const router = express.Router();

const {
  createOrder,
  getAllOrders,
  getOrderById,
  cancelOrder,
} = require("../controllers/orderController");

const authenticate = require("../middleware/authMiddleware");

// ========================================
// CREATE ORDER
// ========================================

router.post(
  "/create",
  authenticate,
  createOrder
);

// ========================================
// GET ALL USER ORDERS
// ========================================

router.get(
  "/",
  authenticate,
  getAllOrders
);

// ========================================
// GET ORDER BY ID
// ========================================

router.get(
  "/:id",
  authenticate,
  getOrderById
);

// ========================================
// CANCEL ORDER
// ========================================

router.patch(
  "/:id/cancel",
  authenticate,
  cancelOrder
);

module.exports = router;