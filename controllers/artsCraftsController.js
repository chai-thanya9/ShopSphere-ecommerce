// controllers/artsCraftsController.js

const ArtsCrafts = require("../models/ArtsCrafts");
const Vendor = require("../models/Vendor");
const fs = require("fs");
const { readBulkFile,} = require("../utils/bulkUpload");


exports.createArtsCrafts = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({
      where: {
        id: req.user.vendorId,
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
        id: req.user.vendorId,
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
        id: req.user.vendorId,
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


/// bulk upload arts and craf
exports.bulkUploadArtsCrafts = async (req, res) => {
  try {
    // ========================================
    // CHECK FILE
    // ========================================

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "CSV or Excel file is required",
      });
    }

    // ========================================
    // GET VENDOR ID FROM JWT
    // ========================================

    // if (!req.vendors || !req.vendors.vendorId) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Vendor authentication information not found",
    //   });
    // }

    const vendorId = req.user.vendorId;

    console.log(
      "Arts & Crafts Bulk Upload Vendor ID:",
      vendorId
    );

    // ========================================
    // READ CSV / EXCEL FILE
    // ========================================

    const rows = await readBulkFile(
      req.file.path,
      req.file.originalname
    );

    // ========================================
    // CHECK EMPTY FILE
    // ========================================

    if (!rows || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "CSV or Excel file is empty",
      });
    }

    console.log(
      "Arts & Crafts rows received:",
      rows.length
    );

    // ========================================
    // PREPARE PRODUCTS
    // ========================================

    const products = rows.map((row) => ({
      // Vendor automatically comes from JWT
      vendorId: vendorId,

      // ========================================
      // PRODUCT INFORMATION
      // ========================================

      productName:
        row.productName?.trim(),

      brandName:
        row.brandName?.trim() || null,

      category:
        row.category?.trim(),

      subCategory:
        row.subCategory?.trim() || null,

      productDescription:
        row.productDescription?.trim() || null,

      // ========================================
      // PRODUCT DETAILS
      // ========================================

      material:
        row.material?.trim() || null,

      color:
        row.color?.trim() || null,

      // ========================================
      // PRICE
      // ========================================

      mrp:
        row.mrp,

      sellingPrice:
        row.sellingPrice,

      discountPercentage:
        row.discountPercentage || 0,

      // ========================================
      // INVENTORY
      // ========================================

      stock:
        row.stock || 0,

      lowStockLimit:
        row.lowStockLimit || 20,

      criticalStockLimit:
        row.criticalStockLimit || 5,

      stockStatus:
        row.stockStatus?.trim() ||
        "In Stock",

      // ========================================
      // IMAGES
      // ========================================

      imageUrls: [],

      cloudinaryPublicIds: [],

      // ========================================
      // STATUS
      // ========================================

      status:
        row.status?.trim() ||
        "Pending",

      // ========================================
      // RATINGS
      // ========================================

      averageRating: 0,

      totalReviews: 0,
    }));

    // ========================================
    // DEBUG
    // ========================================

    console.log(
      "Products prepared for bulk insert:",
      products
    );

    // ========================================
    // BULK INSERT
    // ========================================

    const createdProducts =
      await ArtsCrafts.bulkCreate(products);

    // ========================================
    // SUCCESS
    // ========================================

    return res.status(201).json({
      success: true,

      message:
        "Arts & Crafts bulk upload successful",

      count:
        createdProducts.length,

      data:
        createdProducts,
    });

  } catch (error) {

    // ========================================
    // ERROR
    // ========================================

    console.error(
      "Arts & Crafts Bulk Upload Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Arts & Crafts bulk upload failed",

      error:
        error.message,
    });
  }
};