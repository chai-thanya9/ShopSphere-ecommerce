const HealthCare = require("../models/HealthCare");
const Vendor = require("../models/Vendor");
const cloudinary = require("../config/cloudinary");

// ========================================
// CREATE HEALTH CARE PRODUCT
// ========================================

exports.createHealthCare = async (req, res) => {
  try {
    const {
      productName,
      brandName,
      category,
      subCategory,
      productDescription,
      manufacturer,
      expiryDate,
      mrp,
      sellingPrice,
      discountPercentage,
      stock,
      lowStockLimit,
      criticalStockLimit,
    } = req.body;

    // ========================================
    // FIND LOGGED-IN VENDOR
    // ========================================

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

    // ========================================
    // STOCK STATUS
    // ========================================

    const stockValue = Number(stock);

    const lowLimit =
      lowStockLimit !== undefined
        ? Number(lowStockLimit)
        : 20;

    const criticalLimit =
      criticalStockLimit !== undefined
        ? Number(criticalStockLimit)
        : 5;

    let stockStatus = "In Stock";

    if (stockValue === 0) {
      stockStatus = "Out of Stock";
    } else if (stockValue <= criticalLimit) {
      stockStatus = "Critical Stock";
    } else if (stockValue < lowLimit) {
      stockStatus = "Low Stock";
    }

    // ========================================
    // CLOUDINARY IMAGES
    // ========================================

    const imageUrls = [];
    const cloudinaryPublicIds = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await new Promise(
          (resolve, reject) => {
            const stream =
              cloudinary.uploader.upload_stream(
                {
                  folder: "shopsphere/health-care",
                },
                (error, result) => {
                  if (error) {
                    reject(error);
                  } else {
                    resolve(result);
                  }
                }
              );

            stream.end(file.buffer);
          }
        );

        imageUrls.push(uploadResult.secure_url);
        cloudinaryPublicIds.push(
          uploadResult.public_id
        );
      }
    }

    // ========================================
    // CREATE PRODUCT
    // ========================================

    const healthCare = await HealthCare.create({
      vendorId: vendor.id,

      productName,
      brandName,
      category,
      subCategory,
      productDescription,
      manufacturer,
      expiryDate,

      mrp,
      sellingPrice,
      discountPercentage,

      stock: stockValue,
      lowStockLimit: lowLimit,
      criticalStockLimit: criticalLimit,
      stockStatus,

      imageUrls,
      cloudinaryPublicIds,
    });

    return res.status(201).json({
      success: true,
      message: "Health Care Product Added Successfully",
      data: healthCare,
    });
  } catch (error) {
    console.error(
      "Create Health Care Error:",
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
// GET ALL HEALTH CARE PRODUCTS
// No Vendor Restriction
// ========================================

exports.getAllHealthCare = async (req, res) => {
  try {
    const products = await HealthCare.findAll({
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error(
      "Get Health Care Error:",
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
// GET HEALTH CARE BY ID
// No Vendor Restriction
// ========================================

exports.getHealthCareById = async (req, res) => {
  try {
    const product = await HealthCare.findByPk(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Health Care Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error(
      "Get Health Care By ID Error:",
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
// UPDATE HEALTH CARE
// Vendor Only
// ========================================

exports.updateHealthCare = async (req, res) => {
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

    const product = await HealthCare.findOne({
      where: {
        id: req.params.id,
        vendorId: vendor.id,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Health Care Product not found",
      });
    }

    // ========================================
    // STOCK
    // ========================================

    const stockValue =
      req.body.stock !== undefined
        ? Number(req.body.stock)
        : product.stock;

    const lowLimit =
      req.body.lowStockLimit !== undefined
        ? Number(req.body.lowStockLimit)
        : product.lowStockLimit;

    const criticalLimit =
      req.body.criticalStockLimit !== undefined
        ? Number(req.body.criticalStockLimit)
        : product.criticalStockLimit;

    let stockStatus = "In Stock";

    if (stockValue === 0) {
      stockStatus = "Out of Stock";
    } else if (stockValue <= criticalLimit) {
      stockStatus = "Critical Stock";
    } else if (stockValue < lowLimit) {
      stockStatus = "Low Stock";
    }

    // ========================================
    // IMAGES
    // ========================================

    let imageUrls = product.imageUrls || [];
    let cloudinaryPublicIds =
      product.cloudinaryPublicIds || [];

    if (req.files && req.files.length > 0) {
      // Delete old images
      for (const publicId of cloudinaryPublicIds) {
        if (publicId) {
          await cloudinary.uploader.destroy(
            publicId
          );
        }
      }

      imageUrls = [];
      cloudinaryPublicIds = [];

      // Upload new images
      for (const file of req.files) {
        const uploadResult = await new Promise(
          (resolve, reject) => {
            const stream =
              cloudinary.uploader.upload_stream(
                {
                  folder: "shopsphere/health-care",
                },
                (error, result) => {
                  if (error) {
                    reject(error);
                  } else {
                    resolve(result);
                  }
                }
              );

            stream.end(file.buffer);
          }
        );

        imageUrls.push(uploadResult.secure_url);

        cloudinaryPublicIds.push(
          uploadResult.public_id
        );
      }
    }

    // ========================================
    // UPDATE
    // ========================================

    await product.update({
      ...req.body,

      vendorId: vendor.id,

      stock: stockValue,
      lowStockLimit: lowLimit,
      criticalStockLimit: criticalLimit,
      stockStatus,

      imageUrls,
      cloudinaryPublicIds,
    });

    return res.status(200).json({
      success: true,
      message: "Health Care Product Updated Successfully",
      data: product,
    });
  } catch (error) {
    console.error(
      "Update Health Care Error:",
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
// DELETE HEALTH CARE
// Vendor Only
// ========================================

exports.deleteHealthCare = async (req, res) => {
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

    const product = await HealthCare.findOne({
      where: {
        id: req.params.id,
        vendorId: vendor.id,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Health Care Product not found",
      });
    }

    // ========================================
    // DELETE CLOUDINARY IMAGES
    // ========================================

    if (product.cloudinaryPublicIds) {
      for (const publicId of product.cloudinaryPublicIds) {
        if (publicId) {
          await cloudinary.uploader.destroy(
            publicId
          );
        }
      }
    }

    // ========================================
    // DELETE DATABASE RECORD
    // ========================================

    await product.destroy();

    return res.status(200).json({
      success: true,
      message: "Health Care Product Deleted Successfully",
    });
  } catch (error) {
    console.error(
      "Delete Health Care Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};