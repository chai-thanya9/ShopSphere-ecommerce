// controllers/artsCraftsController.js

const ArtsCrafts = require("../models/ArtsCrafts");
const Vendor = require("../models/Vendor");

// ========================================
// CREATE ARTS & CRAFTS
// Vendor only
// ========================================

exports.createArtsCrafts = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({
      where: {
        userId: req.user.id,
      },
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    const {
      productName,
      brandName,
      category,
      subCategory,
      productDescription,
      material,
      color,
      mrp,
      sellingPrice,
      discountPercentage,
      stock,
      lowStockLimit,
      criticalStockLimit,
      status,
    } = req.body;

    const currentStock = Number(stock || 0);

    const lowLimit =
      lowStockLimit !== undefined
        ? Number(lowStockLimit)
        : 20;

    const criticalLimit =
      criticalStockLimit !== undefined
        ? Number(criticalStockLimit)
        : 5;

    // ========================================
    // STOCK STATUS
    // ========================================

    let stockStatus;

    if (currentStock === 0) {
      stockStatus = "Out of Stock";
    } else if (currentStock < criticalLimit) {
      stockStatus = "Critical Stock";
    } else if (currentStock < lowLimit) {
      stockStatus = "Low Stock";
    } else {
      stockStatus = "In Stock";
    }

    // ========================================
    // IMAGES
    // ========================================

    const imageUrls = req.files
      ? req.files.map((file) => file.path)
      : [];

    const cloudinaryPublicIds = req.files
      ? req.files.map((file) => file.filename)
      : [];

    // ========================================
    // CREATE PRODUCT
    // ========================================

    const product = await ArtsCrafts.create({
      vendorId: vendor.id,

      productName,
      brandName,
      category,
      subCategory,
      productDescription,

      material,
      color,

      mrp,
      sellingPrice,
      discountPercentage:
        discountPercentage || 0,

      stock: currentStock,
      lowStockLimit: lowLimit,
      criticalStockLimit: criticalLimit,
      stockStatus,

      imageUrls,
      cloudinaryPublicIds,

      status: status || "Pending",
    });

    return res.status(201).json({
      success: true,
      message:
        "Arts & Crafts product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Create Arts & Crafts Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// GET ALL ARTS & CRAFTS
// Public
// ========================================

exports.getAllArtsCrafts = async (req, res) => {
  try {
    const products = await ArtsCrafts.findAll({
      include: [
        {
          model: Vendor,
          as: "vendor",
          attributes: [
            "id",
            "vendorName",
            "shopName",
          ],
        },
      ],

      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error(
      "Get Arts & Crafts Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// GET ARTS & CRAFTS BY ID
// Public
// ========================================

exports.getArtsCraftsById = async (req, res) => {
  try {
    const product = await ArtsCrafts.findOne({
      where: {
        id: req.params.id,
      },

      include: [
        {
          model: Vendor,
          as: "vendor",
          attributes: [
            "id",
            "vendorName",
            "shopName",
          ],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Arts & Crafts product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error(
      "Get Arts & Crafts By ID Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// UPDATE ARTS & CRAFTS
// Vendor only
// ========================================

exports.updateArtsCrafts = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({
      where: {
        userId: req.user.id,
      },
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    const product = await ArtsCrafts.findOne({
      where: {
        id: req.params.id,
        vendorId: vendor.id,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Arts & Crafts product not found",
      });
    }

    // ========================================
    // ALLOWED FIELDS
    // ========================================

    const allowedFields = [
      "productName",
      "brandName",
      "category",
      "subCategory",
      "productDescription",
      "material",
      "color",
      "mrp",
      "sellingPrice",
      "discountPercentage",
      "stock",
      "lowStockLimit",
      "criticalStockLimit",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    // ========================================
    // UPDATE STOCK STATUS
    // ========================================

    const stock = Number(product.stock);

    const lowLimit = Number(
      product.lowStockLimit
    );

    const criticalLimit = Number(
      product.criticalStockLimit
    );

    if (stock === 0) {
      product.stockStatus = "Out of Stock";
    } else if (stock < criticalLimit) {
      product.stockStatus = "Critical Stock";
    } else if (stock < lowLimit) {
      product.stockStatus = "Low Stock";
    } else {
      product.stockStatus = "In Stock";
    }

    // ========================================
    // UPDATE IMAGES
    // ========================================

    if (req.files && req.files.length > 0) {
      product.imageUrls = req.files.map(
        (file) => file.path
      );

      product.cloudinaryPublicIds =
        req.files.map(
          (file) => file.filename
        );
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message:
        "Arts & Crafts product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error(
      "Update Arts & Crafts Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// DELETE ARTS & CRAFTS
// Vendor only
// ========================================

exports.deleteArtsCrafts = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({
      where: {
        userId: req.user.id,
      },
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    const product = await ArtsCrafts.findOne({
      where: {
        id: req.params.id,
        vendorId: vendor.id,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Arts & Crafts product not found",
      });
    }

    await product.destroy();

    return res.status(200).json({
      success: true,
      message:
        "Arts & Crafts product deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Arts & Crafts Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};