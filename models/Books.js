// models/Books.js

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Books = sequelize.define(
  "Books",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // Vendor
    vendorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "vendors",
            key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        },

    // Book Information
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    bookType: {
      type: DataTypes.ENUM(
        "Novel",
        "Story Book",
        "Comic",
        "Biography",
        "Autobiography",
        "Educational",
        "Academic",
        "Children",
        "History",
        "Science",
        "Technology",
        "Programming",
        "Self Help",
        "Business",
        "Finance",
        "Spiritual",
        "Religious",
        "Health",
        "Cooking",
        "Travel",
        "Poetry",
        "Dictionary",
        "Encyclopedia",
        "Magazine",
        "Others"
      ),
      allowNull: false,
    },

    titleDescription: {
      type: DataTypes.TEXT,
    },

    authorName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    publisher: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    publicationDate: {
      type: DataTypes.DATEONLY,
    },

    edition: {
      type: DataTypes.STRING,
    },

    language: {
      type: DataTypes.ENUM(
        "English",
        "Telugu",
        "Hindi",
        "Tamil",
        "Kannada",
        "Malayalam",
        "Marathi",
        "Bengali",
        "Gujarati",
        "Urdu",
        "Others"
      ),
      defaultValue: "English",
    },

  

    pages: {
      type: DataTypes.INTEGER,
    },

    format: {
      type: DataTypes.ENUM(
        "Paperback",
        "Hardcover",
        "Ebook"
      ),
      defaultValue: "Paperback",
    },

    // Pricing
    mrp: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
    },

    sellingPrice: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
    },

    discountPercentage: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    // Stock
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    lowStockLimit: {
      type: DataTypes.INTEGER,
      defaultValue: 20,
    },

    criticalStockLimit: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
    },

    stockStatus: {
      type: DataTypes.ENUM(
        "In Stock",
        "Low Stock",
        "Critical Stock",
        "Out of Stock"
      ),
      defaultValue: "In Stock",
    },

    coverImages: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: [],
        },

    // Cloudinary


    cloudinaryPublicIds: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: [],
        },

    // Status
    status: {
      type: DataTypes.ENUM(
        "Active",
        "Inactive"
      ),
      defaultValue: "Active",
    },

    averageRating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    totalReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "Books",
    timestamps: true,
  }
);

module.exports = Books;