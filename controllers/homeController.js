const Home = require("../models/Home");
const Vendor = require("../models/Vendor");
const cloudinary = require("../config/cloudinary");

// ========================================
// CREATE HOME PRODUCT
// ========================================

exports.createHome = async (req, res) => {
  try {
    const {
      productName,
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
    } = req.body;

    // Find logged-in vendor
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

    // ========================================
    // STOCK STATUS
    // ========================================

    const stockValue = Number(stock);

    let stockStatus = "In Stock";

    if (stockValue === 0) {
      stockStatus = "Out of Stock";
    } else if (stockValue < Number(criticalStockLimit || 5)) {
      stockStatus = "Critical Stock";
    } else if (stockValue < Number(lowStockLimit || 20)) {
      stockStatus = "Low Stock";
    }

    // ========================================
    // CLOUDINARY IMAGES
    // ========================================

    const imageUrls = [];
    const cloudinaryPublicIds = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "shopsphere/home",
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
        });

        imageUrls.push(uploadResult.secure_url);
        cloudinaryPublicIds.push(uploadResult.public_id);
      }
    }

    // ========================================
    // CREATE PRODUCT
    // ========================================

    const home = await Home.create({
      vendorId: vendor.id,

      productName,
      category,
      subCategory,
      productDescription,

      material,
      color,

      mrp,
      sellingPrice,
      discountPercentage,

      stock: stockValue,
      lowStockLimit: Number(lowStockLimit || 20),
      criticalStockLimit: Number(criticalStockLimit || 5),
      stockStatus,

      imageUrls,
      cloudinaryPublicIds,
    });

    return res.status(201).json({
      success: true,
      message: "Home product created successfully",
      data: home,
    });
  } catch (error) {
    console.error("Create Home Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// GET ALL HOME PRODUCTS
// Public/User access
// ========================================

exports.getAllHome = async (req, res) => {
  try {
    const products = await Home.findAll({
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
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Get Home Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// GET HOME BY ID
// Public/User access
// ========================================

exports.getHomeById = async (req, res) => {
  try {
    const product = await Home.findOne({
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

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Home product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get Home By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// UPDATE HOME PRODUCT
// Vendor only
// ========================================

exports.updateHome = async (req, res) => {
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

    const product = await Home.findOne({
      where: {
        id: req.params.id,
        vendorId: vendor.id,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Home product not found",
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
    } else if (stockValue < criticalLimit) {
      stockStatus = "Critical Stock";
    } else if (stockValue < lowLimit) {
      stockStatus = "Low Stock";
    }

    // ========================================
    // EXISTING IMAGES
    // ========================================

    let imageUrls = product.imageUrls || [];
    let cloudinaryPublicIds =
      product.cloudinaryPublicIds || [];

    // ========================================
    // NEW IMAGES
    // ========================================

    if (req.files && req.files.length > 0) {
      // Delete old images
      for (const publicId of cloudinaryPublicIds) {
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
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
                  folder: "shopsphere/home",
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

      // Never allow vendorId from request
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
      message: "Home product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Update Home Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// DELETE HOME PRODUCT
// Vendor only
// ========================================

exports.deleteHome = async (req, res) => {
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

    const product = await Home.findOne({
      where: {
        id: req.params.id,
        vendorId: vendor.id,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Home product not found",
      });
    }

    // Delete Cloudinary images
    if (product.cloudinaryPublicIds) {
      for (const publicId of product.cloudinaryPublicIds) {
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }
    }

    await product.destroy();

    return res.status(200).json({
      success: true,
      message: "Home product deleted successfully",
    });
  } catch (error) {
    console.error("Delete Home Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};