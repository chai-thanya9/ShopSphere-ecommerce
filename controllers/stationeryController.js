// controllers/stationeryController.js

const Stationery = require("../models/Stationery");
const Vendor = require("../models/Vendor");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// ========================================
// CREATE STATIONERY
// Vendor only
// ========================================

exports.createStationery = async (req, res) => {
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

    const imageUrls = [];
    const cloudinaryPublicIds = [];

    if (req.files && req.files.length > 0) {

      for (const file of req.files) {
        const uploadResult = await new Promise(
          (resolve, reject) => {
            const stream =
              cloudinary.uploader.upload_stream(
                {
                  folder: "shopsphere/stationery",
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

    const stationery = await Stationery.create({
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
      message: "Stationery product created successfully",
      data: stationery,
    });
  } catch (error) {
    console.error("Create Stationery Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// GET ALL STATIONERY
// No vendor restriction
// ========================================

exports.getAllStationery = async (req, res) => {
  try {
    const stationery = await Stationery.findAll({
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
      count: stationery.length,
      data: stationery,
    });
  } catch (error) {
    console.error("Get Stationery Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// GET STATIONERY BY ID
// No vendor restriction
// ========================================

exports.getStationeryById = async (req, res) => {
  try {
    const stationery = await Stationery.findOne({
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

    if (!stationery) {
      return res.status(404).json({
        success: false,
        message: "Stationery product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: stationery,
    });
  } catch (error) {
    console.error(
      "Get Stationery By ID Error:",
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
// UPDATE STATIONERY
// Vendor only
// ========================================

exports.updateStationery = async (req, res) => {
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

    const stationery = await Stationery.findOne({
      where: {
        id: req.params.id,
        vendorId: vendor.id,
      },
    });

    if (!stationery) {
      return res.status(404).json({
        success: false,
        message: "Stationery product not found",
      });
    }

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
        stationery[field] = req.body[field];
      }
    });

    const stock = Number(stationery.stock);
    const lowLimit = Number(
      stationery.lowStockLimit
    );
    const criticalLimit = Number(
      stationery.criticalStockLimit
    );

    if (stock === 0) {
      stationery.stockStatus = "Out of Stock";
    } else if (stock < criticalLimit) {
      stationery.stockStatus = "Critical Stock";
    } else if (stock < lowLimit) {
      stationery.stockStatus = "Low Stock";
    } else {
      stationery.stockStatus = "In Stock";
    }

    if (req.files && req.files.length > 0) {
      stationery.imageUrls = req.files.map(
        (file) => file.path
      );

      stationery.cloudinaryPublicIds =
        req.files.map(
          (file) => file.filename
        );
    }

    await stationery.save();

    return res.status(200).json({
      success: true,
      message: "Stationery product updated successfully",
      data: stationery,
    });
  } catch (error) {
    console.error(
      "Update Stationery Error:",
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
// DELETE STATIONERY
// Vendor only
// ========================================

exports.deleteStationery = async (req, res) => {
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

    const stationery = await Stationery.findOne({
      where: {
        id: req.params.id,
        vendorId: vendor.id,
      },
    });

    if (!stationery) {
      return res.status(404).json({
        success: false,
        message: "Stationery product not found",
      });
    }

    await stationery.destroy();

    return res.status(200).json({
      success: true,
      message: "Stationery product deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Stationery Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};