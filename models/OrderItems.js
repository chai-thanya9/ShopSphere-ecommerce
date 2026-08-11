const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const OrderItems = sequelize.define(
  "OrderItems",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // Order
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "orders",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    vendorId: {
        type: DataTypes.UUID,
        allowNull: false,
        },

    // Product
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    // Product Type
    productType: {
      type: DataTypes.ENUM(
        "Books",
        "Fashion"
      ),
      allowNull: false,
    },

    // Product information at purchase time
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // Quantity purchased
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    // Price at the time of purchase
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    // quantity × unitPrice
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    // For Fashion
    size: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    color: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "order_items",
    timestamps: true,
  }
);

module.exports = OrderItems;