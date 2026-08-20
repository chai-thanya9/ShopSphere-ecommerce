const Furniture = require("../models/Furniture");
const Vendor = require("../models/Vendor");
const cloudinary = require("../config/cloudinary");

// ========================================
// STOCK STATUS
// ========================================

const getStockStatus = (stock, criticalStockLimit, lowStockLimit) => {
  if (stock === 0) {
    return "Out of Stock";
  }

  if (stock <= criticalStockLimit) {
    return "Critical Stock";
  }

  if (stock < lowStockLimit) {
    return "Low Stock";
  }

  return "In Stock";
};

// ========================================
// CREATE FURNITURE
// ========================================

exports.createFurniture = async (req, res) => {
  try {
    const {
      productName,
      brandName,
      category,
      productDescription,
      material,
      color,
      finishType,
      seatingCapacity,
      lengthCm,
      widthCm,
      heightCm,
      mrp,
      sellingPrice,
      discountPercentage,
      stock,
      lowStockLimit,
      criticalStockLimit,
      status,
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
    // STOCK
    // ========================================

    const stockValue = Number(stock || 0);

    const lowStockValue =
      lowStockLimit !== undefined
        ? Number(lowStockLimit)
        : 20;

    const criticalStockValue =
      criticalStockLimit !== undefined
        ? Number(criticalStockLimit)
        : 5;

    const stockStatus = getStockStatus(
      stockValue,
      criticalStockValue,
      lowStockValue
    );

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
                  folder: "shopsphere/furniture",
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
    // CREATE FURNITURE
    // ========================================

    const furniture = await Furniture.create({
      vendorId: vendor.id,

      productName,
      brandName,
      category,
      productDescription,

      material,
      color,
      finishType,
      seatingCapacity,

      lengthCm,
      widthCm,
      heightCm,

      mrp,
      sellingPrice,
      discountPercentage:
        Number(discountPercentage || 0),

      stock: stockValue,
      lowStockLimit: lowStockValue,
      criticalStockLimit: criticalStockValue,
      stockStatus,

      imageUrls,
      cloudinaryPublicIds,

      status: status || "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "Furniture product created successfully",
      data: furniture,
    });
  } catch (error) {
    console.error(
      "Create Furniture Error:",
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
// GET ALL FURNITURE
// PUBLIC
// ========================================

exports.getAllFurniture = async (req, res) => {
  try {
    const furniture = await Furniture.findAll({
      include: [
        {
          model: Vendor,
          as: "vendor",
          attributes: [
            "vendorName",
            "shopName",
          ],
        },
      ],

      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: furniture.length,
      data: furniture,
    });
  } catch (error) {
    console.error(
      "Get Furniture Error:",
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
// GET FURNITURE BY ID
// PUBLIC
// ========================================

exports.getFurnitureById = async (req, res) => {
  try {
    const furniture = await Furniture.findOne({
      where: {
        id: req.params.id,
      },

      include: [
        {
          model: Vendor,
          as: "vendor",
          attributes: [
            "vendorName",
            "shopName",
          ],
        },
      ],
    });

    if (!furniture) {
      return res.status(404).json({
        success: false,
        message: "Furniture product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: furniture,
    });
  } catch (error) {
    console.error(
      "Get Furniture By ID Error:",
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
// UPDATE FURNITURE
// ========================================

exports.updateFurniture = async (req, res) => {
  try {
    // ========================================
    // FIND VENDOR
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
    // FIND PRODUCT
    // ========================================

    const furniture = await Furniture.findOne({
      where: {
        id: req.params.id,
        vendorId: vendor.id,
      },
    });

    if (!furniture) {
      return res.status(404).json({
        success: false,
        message: "Furniture product not found",
      });
    }

    // ========================================
    // STOCK
    // ========================================

    const stockValue =
      req.body.stock !== undefined
        ? Number(req.body.stock)
        : furniture.stock;

    const lowStockValue =
      req.body.lowStockLimit !== undefined
        ? Number(req.body.lowStockLimit)
        : furniture.lowStockLimit;

    const criticalStockValue =
      req.body.criticalStockLimit !== undefined
        ? Number(req.body.criticalStockLimit)
        : furniture.criticalStockLimit;

    const stockStatus = getStockStatus(
      stockValue,
      criticalStockValue,
      lowStockValue
    );

    // ========================================
    // OLD IMAGES
    // ========================================

    let imageUrls = furniture.imageUrls || [];

    let cloudinaryPublicIds =
      furniture.cloudinaryPublicIds || [];

    // ========================================
    // NEW IMAGES
    // ========================================

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
                  folder: "shopsphere/furniture",
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

        imageUrls.push(
          uploadResult.secure_url
        );

        cloudinaryPublicIds.push(
          uploadResult.public_id
        );
      }
    }

    // ========================================
    // UPDATE
    // ========================================

    await furniture.update({
      ...req.body,

      // Never allow vendorId from request
      vendorId: vendor.id,

      stock: stockValue,
      lowStockLimit: lowStockValue,
      criticalStockLimit: criticalStockValue,
      stockStatus,

      imageUrls,
      cloudinaryPublicIds,
    });

    return res.status(200).json({
      success: true,
      message:
        "Furniture product updated successfully",
      data: furniture,
    });
  } catch (error) {
    console.error(
      "Update Furniture Error:",
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
// DELETE FURNITURE
// ========================================

exports.deleteFurniture = async (req, res) => {
  try {
    // ========================================
    // FIND VENDOR
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
    // FIND PRODUCT
    // ========================================

    const furniture = await Furniture.findOne({
      where: {
        id: req.params.id,
        vendorId: vendor.id,
      },
    });

    if (!furniture) {
      return res.status(404).json({
        success: false,
        message: "Furniture product not found",
      });
    }

    // ========================================
    // DELETE CLOUDINARY IMAGES
    // ========================================

    if (furniture.cloudinaryPublicIds) {
      for (const publicId of furniture.cloudinaryPublicIds) {
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

    await furniture.destroy();

    return res.status(200).json({
      success: true,
      message:
        "Furniture product deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Furniture Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};