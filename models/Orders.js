const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Orders = sequelize.define(
  "Orders",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // Customer
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    // Order Number
    orderNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    // Order Amount
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    shippingFee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    // Order Status
    orderStatus: {
      type: DataTypes.ENUM(
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
        "Returned",
        "Refunded"
      ),
      defaultValue: "Pending",
    },

    // Payment
    paymentMethod: {
      type: DataTypes.ENUM(
        "COD",
        "UPI",
        "Card",
        "Net Banking",
        "Wallet"
      ),
      allowNull: false,
    },

    paymentStatus: {
      type: DataTypes.ENUM(
        "Pending",
        "Paid",
        "Failed",
        "Refunded"
      ),
      defaultValue: "Pending",
    },

    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Delivery Address
    deliveryAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    postalCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    country: {
      type: DataTypes.STRING,
      defaultValue: "India",
    },

    // Delivery
    expectedDeliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    cancellationReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "orders",
    timestamps: true,
  }
);

module.exports = Orders;