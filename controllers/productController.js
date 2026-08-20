const Fashion = require("../models/Fashion");
const Electronics = require("../models/Electronics");
const Beauty = require("../models/Beauty");
const Home = require("../models/Home");
const Appliances = require("../models/Appliances");
const Furniture = require("../models/Furniture");
const Books = require("../models/Books");
const Sports = require("../models/Sports");
const HealthCare = require("../models/HealthCare");
const Groceries = require("../models/Groceries");
const Toys = require("../models/Toys");
const Stationery = require("../models/Stationery");
const MusicalInstruments = require("../models/MusicalInstruments");
const ArtsCrafts = require("../models/ArtsCrafts");

// ========================================
// PRODUCT MODELS
// ========================================

const productModels = {
  Fashion,
  Electronics,
  Beauty,
  Home,
  Appliances,
  Furniture,
  Books,
  Sports,
  "Health Care": HealthCare,
  Groceries,
  Toys,
  Stationery,
  "Musical Instruments": MusicalInstruments,
  "Arts & Crafts": ArtsCrafts,
};

// ========================================
// GET ALL PRODUCTS
// ========================================

exports.getAllProducts = async (req, res) => {
  try {
    const products = [];

    for (const [category, Model] of Object.entries(productModels)) {
      const data = await Model.findAll({
        order: [["createdAt", "DESC"]],
      });

      data.forEach((product) => {
        products.push({
          ...product.toJSON(),
          productCategory: category,
        });
      });
    }

    return res.status(200).json({
      success: true,
      message: "All products fetched successfully",
      totalProducts: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Get All Products Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// ========================================
// GET PRODUCTS BY CATEGORY
// ========================================

exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    const Model = productModels[category];

    if (!Model) {
      return res.status(400).json({
        success: false,
        message: "Invalid product category",
        allowedCategories: Object.keys(productModels),
      });
    }

    const products = await Model.findAll({
      order: [["createdAt", "DESC"]],
    });

    const data = products.map((product) => ({
      ...product.toJSON(),
      productCategory: category,
    }));

    return res.status(200).json({
      success: true,
      message: `${category} products fetched successfully`,
      category,
      totalProducts: data.length,
      data,
    });
  } catch (error) {
    console.error("Get Products By Category Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products by category",
      error: error.message,
    });
  }
};

// ========================================
// GET PRODUCT BY ID
// ========================================

exports.getProductById = async (req, res) => {
  try {
    const { category, id } = req.params;

    if (!category || !id) {
      return res.status(400).json({
        success: false,
        message: "Category and product ID are required",
      });
    }

    const Model = productModels[category];

    if (!Model) {
      return res.status(400).json({
        success: false,
        message: "Invalid product category",
        allowedCategories: Object.keys(productModels),
      });
    }

    const product = await Model.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: {
        ...product.toJSON(),
        productCategory: category,
      },
    });
  } catch (error) {
    console.error("Get Product By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};