const Appliances = require("../models/Appliances");
const Vendor = require("../models/Vendor");
const cloudinary = require("../config/cloudinary");

// ========================================
// CREATE APPLIANCE
// ========================================

exports.createAppliances = async (req, res) => {
  try {
    const {
      productName,
      brandName,
      category,
      subCategory,
      productDescription,
      modelNumber,
      color,
      warranty,
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

    const lowLimit =
      lowStockLimit !== undefined
        ? Number(lowStockLimit)
        : 20;

    const criticalLimit =
      criticalStockLimit !== undefined
        ? Number(criticalStockLimit)
        : 5;

    let stockStatus;

    if (stockValue === 0) {
      stockStatus = "Out of Stock";
    } else if (stockValue <= criticalLimit) {
      stockStatus = "Critical Stock";
    } else if (stockValue < lowLimit) {
      stockStatus = "Low Stock";
    } else {
      stockStatus = "In Stock";
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
                  folder: "shopsphere/appliances",
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

    const appliance = await Appliances.create({
      vendorId: vendor.id,

      productName,
      brandName,
      category,
      subCategory,
      productDescription,

      modelNumber,
      color,
      warranty,

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
      message: "Appliance added successfully",
      data: appliance,
    });
  } catch (error) {
    console.error(
      "Create Appliance Error:",
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
// GET ALL APPLIANCES
// ========================================

exports.getAllAppliances = async (req, res) => {
  try {
    const appliances = await Appliances.findAll({
      include: [
        {
          model: Vendor,
          as: "vendor",
          attributes: [
            "shopName",
            "vendorName",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: appliances.length,
      data: appliances,
    });
  } catch (error) {
    console.error(
      "Get Appliances Error:",
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
// GET APPLIANCE BY ID
// ========================================

exports.getApplianceById = async (req, res) => {
  try {
    const appliance = await Appliances.findOne({
      where: {
        id: req.params.id,
      },

      include: [
        {
          model: Vendor,
          as: "vendor",
          attributes: [
            "shopName",
            "vendorName",
          ],
        },
      ],
    });

    if (!appliance) {
      return res.status(404).json({
        success: false,
        message: "Appliance not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: appliance,
    });
  } catch (error) {
    console.error(
      "Get Appliance By ID Error:",
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
// UPDATE APPLIANCE
// ========================================

exports.updateAppliances = async (req, res) => {
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

    const appliance = await Appliances.findOne({
      where: {
        id: req.params.id,
        vendorId: vendor.id,
      },
    });

    if (!appliance) {
      return res.status(404).json({
        success: false,
        message: "Appliance not found",
      });
    }

    // ========================================
    // STOCK
    // ========================================

    const stockValue =
      req.body.stock !== undefined
        ? Number(req.body.stock)
        : appliance.stock;

    const lowLimit =
      req.body.lowStockLimit !== undefined
        ? Number(req.body.lowStockLimit)
        : appliance.lowStockLimit;

    const criticalLimit =
      req.body.criticalStockLimit !== undefined
        ? Number(req.body.criticalStockLimit)
        : appliance.criticalStockLimit;

    let stockStatus;

    if (stockValue === 0) {
      stockStatus = "Out of Stock";
    } else if (stockValue <= criticalLimit) {
      stockStatus = "Critical Stock";
    } else if (stockValue < lowLimit) {
      stockStatus = "Low Stock";
    } else {
      stockStatus = "In Stock";
    }

    // ========================================
    // EXISTING IMAGES
    // ========================================

    let imageUrls =
      appliance.imageUrls || [];

    let cloudinaryPublicIds =
      appliance.cloudinaryPublicIds || [];

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
                  folder:
                    "shopsphere/appliances",
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

    await appliance.update({
      ...req.body,

      // Never take vendorId from request
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
      message: "Appliance updated successfully",
      data: appliance,
    });
  } catch (error) {
    console.error(
      "Update Appliance Error:",
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
// DELETE APPLIANCE
// ========================================

exports.deleteAppliances = async (req, res) => {
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

    const appliance = await Appliances.findOne({
      where: {
        id: req.params.id,
        vendorId: vendor.id,
      },
    });

    if (!appliance) {
      return res.status(404).json({
        success: false,
        message: "Appliance not found",
      });
    }

    // ========================================
    // DELETE CLOUDINARY IMAGES
    // ========================================

    if (appliance.cloudinaryPublicIds) {
      for (const publicId of appliance.cloudinaryPublicIds) {
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

    await appliance.destroy();

    return res.status(200).json({
      success: true,
      message: "Appliance deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Appliance Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};