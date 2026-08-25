const Sports = require("../models/Sports");
const Vendor = require("../models/Vendor");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");


// ========================================
// STOCK STATUS
// ========================================

const getStockStatus = (
  stock,
  criticalStockLimit,
  lowStockLimit
) => {
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
// CREATE SPORTS PRODUCT
// ========================================

exports.createSports = async (req, res) => {
  try {
    const {
      productName,
      brandName,
      category,
      subCategory,
      productDescription,
      material,
      color,
      size,
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
    // ================================
    const imageUrls = [];
    const cloudinaryPublicIds = [];

    if (req.files && req.files.length > 0) {

      for (const file of req.files) {
        const uploadResult = await new Promise(
          (resolve, reject) => {
            const stream =
              cloudinary.uploader.upload_stream(
                {
                  folder: "shopsphere/sports",
                  resource_type: "image",
                },
                (error, result) => {

                  if (error) {
                    console.error(
                      "Cloudinary Error:",
                      error
                    );

                    reject(error);
                    return;
                  }

                  console.log(
                    "Cloudinary Result:",
                    result
                  );

                  resolve(result);
                }
              );

            stream.end(file.buffer);
          }
        );

        if (!uploadResult) {
          throw new Error(
            "Cloudinary did not return upload result"
          );
        }

        if (!uploadResult.secure_url) {
          throw new Error(
            "Cloudinary secure_url is missing"
          );
        }

        // Add Cloudinary URL
        imageUrls.push(
          uploadResult.secure_url
        );

        // Add Cloudinary public ID
        cloudinaryPublicIds.push(
          uploadResult.public_id
        );
      }
    }
    // ========================================
    // CREATE PRODUCT
    // ========================================

    const sports = await Sports.create({
      vendorId: vendor.id,

      productName,
      brandName,
      category,
      subCategory,
      productDescription,

      material,
      color,
      size,

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
      message: "Sports product created successfully",
      data: sports,
    });
  } catch (error) {
    console.error(
      "Create Sports Error:",
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
// GET ALL SPORTS
// PUBLIC
// ========================================

exports.getAllSports = async (req, res) => {
  try {
    const sports = await Sports.findAll({
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
      count: sports.length,
      data: sports,
    });
  } catch (error) {
    console.error(
      "Get Sports Error:",
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
// GET SPORTS BY ID
// PUBLIC
// ========================================

exports.getSportsById = async (req, res) => {
  try {
    const sports = await Sports.findOne({
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

    if (!sports) {
      return res.status(404).json({
        success: false,
        message: "Sports product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: sports,
    });
  } catch (error) {
    console.error(
      "Get Sports By ID Error:",
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
// UPDATE SPORTS
// ========================================

exports.updateSports = async (req, res) => {
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

    const sports = await Sports.findOne({
      where: {
        id: req.params.id,
        vendorId: vendor.id,
      },
    });

    if (!sports) {
      return res.status(404).json({
        success: false,
        message: "Sports product not found",
      });
    }

    // ========================================
    // STOCK
    // ========================================

    const stockValue =
      req.body.stock !== undefined
        ? Number(req.body.stock)
        : sports.stock;

    const lowStockValue =
      req.body.lowStockLimit !== undefined
        ? Number(req.body.lowStockLimit)
        : sports.lowStockLimit;

    const criticalStockValue =
      req.body.criticalStockLimit !== undefined
        ? Number(req.body.criticalStockLimit)
        : sports.criticalStockLimit;

    const stockStatus = getStockStatus(
      stockValue,
      criticalStockValue,
      lowStockValue
    );

    // ========================================
    // EXISTING IMAGES
    // ========================================

    let imageUrls = sports.imageUrls || [];

    let cloudinaryPublicIds =
      sports.cloudinaryPublicIds || [];

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
                  folder: "shopsphere/sports",
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
    // UPDATE PRODUCT
    // ========================================

    await sports.update({
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
      message: "Sports product updated successfully",
      data: sports,
    });
  } catch (error) {
    console.error(
      "Update Sports Error:",
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
// DELETE SPORTS
// ========================================

exports.deleteSports = async (req, res) => {
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

    const sports = await Sports.findOne({
      where: {
        id: req.params.id,
        vendorId: vendor.id,
      },
    });

    if (!sports) {
      return res.status(404).json({
        success: false,
        message: "Sports product not found",
      });
    }

    // ========================================
    // DELETE CLOUDINARY IMAGES
    // ========================================

    if (sports.cloudinaryPublicIds) {
      for (const publicId of sports.cloudinaryPublicIds) {
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

    await sports.destroy();

    return res.status(200).json({
      success: true,
      message: "Sports product deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Sports Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};