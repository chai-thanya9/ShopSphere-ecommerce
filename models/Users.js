const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = sequelize.define(
  "Users_info",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "First name is required",
        },
      },
    },

    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Last name is required",
        },
      },
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: "Invalid email address",
        },
      },
    },

    emailOtp: {
      type: DataTypes.STRING(6),
      allowNull: true,
    },

    emailOtpExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    emailVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    mobileNumber: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: "Mobile number is required",
        },
      },
    },



    
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    role: {
      type: DataTypes.ENUM("Customer", "Vendor", "Admin"),
      allowNull: false,
      defaultValue: "Customer",
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    emailOtpAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

  

    loginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    lockUntil: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,

    indexes: [
      {
        fields: ["email"],
      },
      {
        fields: ["mobileNumber"],
      },
      {
        fields: ["role"],
      },
      {
        fields: ["isActive"],
      },
    ],
  }
);

module.exports = User;