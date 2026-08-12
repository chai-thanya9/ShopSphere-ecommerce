// controllers/toysController.js

const Toys = require("../models/Toys");
const Vendor = require("../models/Vendor");

// ========================================
// CREATE TOY
// ========================================

exports.createToys = async (req, res) => {
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
      ageGroup,
      gender,
      material,
      mrp,
      sellingPrice,
      discountPercentage,
      stock,
      lowStockLimit,
      criticalStockLimit,
      status,
    } = req.body;

    const currentStock = Number(stock || 0);
    const lowLimit = Number(lowStockLimit || 20);
    const criticalLimit = Number(criticalStockLimit || 5);

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

    const imageUrls = req.files
      ? req.files.map((file) => file.path)
      : [];

    const cloudinaryPublicIds = req.files
      ? req.files.map((file) => file.filename)
      : [];

    const toy = await Toys.create({
      vendorId: vendor.id,

      productName,
      brandName,
      category,
      subCategory,
      productDescription,

      ageGroup,
      gender,
      material,

      mrp,
      sellingPrice,
      discountPercentage: discountPercentage || 0,

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
      message: "Toy product created successfully",
      data: toy,
    });
  } catch (error) {
    console.error("Create Toy Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// GET ALL TOYS
// No vendor restriction
// ========================================

exports.getAllToys = async (req, res) => {
  try {
    const toys = await Toys.findAll({
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
      count: toys.length,
      data: toys,
    });
  } catch (error) {
    console.error("Get Toys Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// GET TOY BY ID
// No vendor restriction
// ========================================

exports.getToyById = async (req, res) => {
  try {
    const toy = await Toys.findOne({
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

    if (!toy) {
      return res.status(404).json({
        success: false,
        message: "Toy product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: toy,
    });
  } catch (error) {
    console.error("Get Toy By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// UPDATE TOY
// Vendor only
// ========================================

exports.updateToy = async (req, res) => {
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

    const toy = await Toys.findOne({
      where: {
        id: req.params.id,
        vendorId: vendor.id,
      },
    });

    if (!toy) {
      return res.status(404).json({
        success: false,
        message: "Toy product not found",
      });
    }

    const allowedFields = [
      "productName",
      "brandName",
      "category",
      "subCategory",
      "productDescription",
      "ageGroup",
      "gender",
      "material",
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
        toy[field] = req.body[field];
      }
    });

    const stock = Number(toy.stock);
    const lowLimit = Number(toy.lowStockLimit);
    const criticalLimit = Number(toy.criticalStockLimit);

    if (stock === 0) {
      toy.stockStatus = "Out of Stock";
    } else if (stock < criticalLimit) {
      toy.stockStatus = "Critical Stock";
    } else if (stock < lowLimit) {
      toy.stockStatus = "Low Stock";
    } else {
      toy.stockStatus = "In Stock";
    }

    if (req.files && req.files.length > 0) {
      toy.imageUrls = req.files.map(
        (file) => file.path
      );

      toy.cloudinaryPublicIds = req.files.map(
        (file) => file.filename
      );
    }

    await toy.save();

    return res.status(200).json({
      success: true,
      message: "Toy product updated successfully",
      data: toy,
    });
  } catch (error) {
    console.error("Update Toy Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// DELETE TOY
// Vendor only
// ========================================

exports.deleteToy = async (req, res) => {
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

    const toy = await Toys.findOne({
      where: {
        id: req.params.id,
        vendorId: vendor.id,
      },
    });

    if (!toy) {
      return res.status(404).json({
        success: false,
        message: "Toy product not found",
      });
    }

    await toy.destroy();

    return res.status(200).json({
      success: true,
      message: "Toy product deleted successfully",
    });
  } catch (error) {
    console.error("Delete Toy Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};