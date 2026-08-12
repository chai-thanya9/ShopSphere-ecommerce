const Groceries = require("../models/Groceries");
const Vendor = require("../models/Vendor");

// ========================================
// CREATE GROCERY
// ========================================

exports.createGroceries = async (req, res) => {
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
      unit,
      quantity,
      expiryDate,
      mrp,
      sellingPrice,
      discountPercentage,
      stock,
      lowStockLimit,
      criticalStockLimit,
    } = req.body;

    let stockStatus;

    if (Number(stock) === 0) {
      stockStatus = "Out of Stock";
    } else if (Number(stock) < Number(criticalStockLimit || 5)) {
      stockStatus = "Critical Stock";
    } else if (Number(stock) < Number(lowStockLimit || 20)) {
      stockStatus = "Low Stock";
    } else {
      stockStatus = "In Stock";
    }

    const imageUrls = req.files
      ? req.files.map((file) => file.path)
      : [];

    const cloudinaryPublicIds = req.files
      ? req.files.map((file) => file.filename)
      : [];

    const grocery = await Groceries.create({
      vendorId: vendor.id,

      productName,
      brandName,
      category,
      subCategory,
      productDescription,

      unit,
      quantity,

      expiryDate,

      mrp,
      sellingPrice,
      discountPercentage: discountPercentage || 0,

      stock: stock || 0,
      lowStockLimit: lowStockLimit || 20,
      criticalStockLimit: criticalStockLimit || 5,
      stockStatus,

      imageUrls,
      cloudinaryPublicIds,

      status: "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "Grocery product created successfully",
      data: grocery,
    });
  } catch (error) {
    console.error("Create Grocery Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// GET ALL GROCERY PRODUCTS
// ========================================

exports.getAllGroceries = async (req, res) => {
  try {
    const groceries = await Groceries.findAll({
      include: [
        {
          model: Vendor,
          as: "vendor",
          attributes: ["id", "vendorName", "shopName"],
        },
      ],

      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: groceries.length,
      data: groceries,
    });
  } catch (error) {
    console.error("Get Groceries Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// GET GROCERY BY ID
// ========================================

exports.getGroceriesById = async (req, res) => {
  try {
    const grocery = await Groceries.findOne({
      where: {
        id: req.params.id,
      },

      include: [
        {
          model: Vendor,
          as: "vendor",
          attributes: ["id", "vendorName", "shopName"],
        },
      ],
    });

    if (!grocery) {
      return res.status(404).json({
        success: false,
        message: "Grocery product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: grocery,
    });
  } catch (error) {
    console.error("Get Grocery By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// UPDATE GROCERY
// ========================================

exports.updateGroceries = async (req, res) => {
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

    const grocery = await Groceries.findOne({
      where: {
        id: req.params.id,
        vendorId: vendor.id,
      },
    });

    if (!grocery) {
      return res.status(404).json({
        success: false,
        message: "Grocery product not found",
      });
    }

    const allowedFields = [
      "productName",
      "brandName",
      "category",
      "subCategory",
      "productDescription",
      "unit",
      "quantity",
      "expiryDate",
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
        grocery[field] = req.body[field];
      }
    });

    const stock = Number(grocery.stock);
    const lowStockLimit = Number(grocery.lowStockLimit);
    const criticalStockLimit = Number(grocery.criticalStockLimit);

    if (stock === 0) {
      grocery.stockStatus = "Out of Stock";
    } else if (stock < criticalStockLimit) {
      grocery.stockStatus = "Critical Stock";
    } else if (stock < lowStockLimit) {
      grocery.stockStatus = "Low Stock";
    } else {
      grocery.stockStatus = "In Stock";
    }

    if (req.files && req.files.length > 0) {
      grocery.imageUrls = req.files.map(
        (file) => file.path
      );

      grocery.cloudinaryPublicIds = req.files.map(
        (file) => file.filename
      );
    }

    await grocery.save();

    return res.status(200).json({
      success: true,
      message: "Grocery product updated successfully",
      data: grocery,
    });
  } catch (error) {
    console.error("Update Grocery Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// DELETE GROCERY
// ========================================

exports.deleteGroceries = async (req, res) => {
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

    const grocery = await Groceries.findOne({
      where: {
        id: req.params.id,
        vendorId: vendor.id,
      },
    });

    if (!grocery) {
      return res.status(404).json({
        success: false,
        message: "Grocery product not found",
      });
    }

    await grocery.destroy();

    return res.status(200).json({
      success: true,
      message: "Grocery product deleted successfully",
    });
  } catch (error) {
    console.error("Delete Grocery Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};