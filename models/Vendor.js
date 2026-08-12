const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Vendor = sequelize.define(
  "Vendor",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    vendorName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    businessType: {
      type: DataTypes.ENUM(
        "Fashion", //1
        "Electronics",//2
        "Beauty",//3
        "Home",//4
        "Appliances",//6
        "Furniture",//7
        "Books", ///5
        "Sports",//8
        "Health Care",//9
        "Groceries", //10
        "Toys",//11
        "Stationery",//12
        "Musical Instruments",//13
        "Arts & Crafts", //14
        "Mobiles",
        "Others"
      ),
      allowNull: false,
    },

    shopName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

   
    status: {
      type: DataTypes.ENUM(
        "Pending",
        "Approved",
        "Rejected",
        "Blocked"
      ),
      defaultValue: "Pending",
    },

    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "vendors",
    timestamps: true,
  }
);

module.exports = Vendor;