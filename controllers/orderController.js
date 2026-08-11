const Orders = require("../models/Orders");
const OrderItems = require("../models/OrderItems");
const Books = require("../models/Books");
const Fashion = require("../models/Fashion");

// ========================================
// CREATE ORDER
// ========================================

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      items,
      paymentMethod,
      deliveryAddress,
      city,
      state,
      postalCode,
      country,
    } = req.body;

    // ------------------------------------
    // Validate items
    // ------------------------------------

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order items are required",
      });
    }

    // ------------------------------------
    // Calculate order
    // ------------------------------------

    let subtotal = 0;

    const orderItemsData = [];

    for (const item of items) {
      const {
        productId,
        productType,
        quantity,
        size,
        color,
      } = item;

      let product;

      // -------------------------------
      // BOOK
      // -------------------------------

      if (productType === "Books") {
        product = await Books.findByPk(productId);
      }

      // -------------------------------
      // FASHION
      // -------------------------------

      else if (productType === "Fashion") {
        product = await Fashion.findByPk(productId);
      }

      else {
        return res.status(400).json({
          success: false,
          message: `Invalid product type: ${productType}`,
        });
      }

      // --------------------------------
      // Product not found
      // --------------------------------

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${productId}`,
        });
      }

      // --------------------------------
      // Check stock
      // --------------------------------

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.title || product.productName} has insufficient stock`,
        });
      }

      // --------------------------------
      // Product price
      // --------------------------------

      const unitPrice = Number(
        product.sellingPrice
      );

      const itemSubtotal = unitPrice * quantity;

      subtotal += itemSubtotal;

      // --------------------------------
      // Reduce stock
      // --------------------------------

      product.stock = product.stock - quantity;

      if (product.stock === 0) {
        product.stockStatus = "Out of Stock";
      } else if (product.stock < 5) {
        product.stockStatus = `Only ${product.stock} Left`;
      } else if (product.stock < 20) {
        product.stockStatus = "Low Stock";
      } else {
        product.stockStatus = "In Stock";
      }

      await product.save();

      // --------------------------------
      // Order Item
      // --------------------------------

      orderItemsData.push({
        productId,
        productType,
        productName:
          product.title ||
          product.productName ||
          "Product",
        quantity,
        unitPrice,
        subtotal: itemSubtotal,
        vendorId: product.vendorId,
        size: size || null,
        color: color || null,
      });
    }

    // ==================================
    // ORDER NUMBER
    // ==================================

    const orderNumber =
      `ORD-${Date.now()}`;

    // ==================================
    // CREATE ORDER
    // ==================================

    const order = await Orders.create({
      userId,

      orderNumber,

      subtotal,

      shippingFee: 0,

      taxAmount: 0,

      discountAmount: 0,

      totalAmount: subtotal,

      paymentMethod,

      paymentStatus:
        paymentMethod === "COD"
          ? "Pending"
          : "Pending",

      deliveryAddress,
      city,
      state,
      postalCode,
      country: country || "India",

      orderStatus: "Pending",
    });

    // ==================================
    // CREATE ORDER ITEMS
    // ==================================

    const orderItems = orderItemsData.map(
      (item) => ({
        ...item,
        orderId: order.id,
      })
    );

    await OrderItems.bulkCreate(orderItems);

    // ==================================
    // RESPONSE
    // ==================================

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        order,
        items: orderItems,
      },
    });

  } catch (error) {
    console.error("Create Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// GET ALL USER ORDERS
// ========================================

exports.getAllOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Orders.findAll({
      where: {
        userId,
      },

      include: [
        {
          model: OrderItems,
          as: "items",
        },
      ],

      order: [
        ["createdAt", "DESC"],
      ],
    });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });

  } catch (error) {
    console.error("Get Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// GET ORDER BY ID
// ========================================

exports.getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;

    const order = await Orders.findOne({
      where: {
        id: req.params.id,
        userId,
      },

      include: [
        {
          model: OrderItems,
          as: "items",
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });

  } catch (error) {
    console.error("Get Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// CANCEL ORDER
// ========================================

exports.cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const order = await Orders.findOne({
      where: {
        id: req.params.id,
        userId,
      },

      include: [
        {
          model: OrderItems,
          as: "items",
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      order.orderStatus === "Delivered" ||
      order.orderStatus === "Cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled",
      });
    }

    // --------------------------------
    // Restore stock
    // --------------------------------

    for (const item of order.items) {
      let product;

      if (item.productType === "Books") {
        product = await Books.findByPk(
          item.productId
        );
      }

      if (item.productType === "Fashion") {
        product = await Fashion.findByPk(
          item.productId
        );
      }

      if (product) {
        product.stock =
          Number(product.stock) +
          Number(item.quantity);

        if (product.stock === 0) {
          product.stockStatus = "Out of Stock";
        } else if (product.stock < 5) {
          product.stockStatus =
            `Only ${product.stock} Left`;
        } else if (product.stock < 20) {
          product.stockStatus = "Low Stock";
        } else {
          product.stockStatus = "In Stock";
        }

        await product.save();
      }
    }

    await order.update({
      orderStatus: "Cancelled",
      cancelledAt: new Date(),
      cancellationReason:
        req.body.reason || null,
    });

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });

  } catch (error) {
    console.error("Cancel Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};