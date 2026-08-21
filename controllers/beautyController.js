const Beauty = require("../models/Beauty");
const Vendor = require("../models/Vendor");
const cloudinary = require("../config/cloudinary");

// ========================================
// CREATE BEAUTY
// ========================================

exports.createBeauty = async (req, res) => {
  try {
    const {
      productName,
      brandName,
      category,
      subCategory,
      productDescription,
      quantity,
      skinType,
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
    // STOCK
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

    const Images = [];
        const cloudinaryPublicIds = [];
    
        if (req.files && req.files.length > 0) {
    
          for (const file of req.files) {
            const uploadResult = await new Promise(
              (resolve, reject) => {
                const stream =
                  cloudinary.uploader.upload_stream(
                    {
                      folder: "shopsphere/books",
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
            Images.push(
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

    const beauty = await Beauty.create({
      vendorId: vendor.id,

      productName,
      brandName,
      category,
      subCategory,
      productDescription,
      quantity,
      skinType,

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
      message: "Beauty product created successfully",
      data: beauty,
    });
  } catch (error) {
    console.error("Create Beauty Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// GET ALL BEAUTY
// No vendor restriction
// ========================================

exports.getAllBeauty = async (req, res) => {
  try {
    const products = await Beauty.findAll({
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Get Beauty Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// GET BEAUTY BY ID
// No vendor restriction
// ========================================

exports.getBeautyById = async (req, res) => {
  try {
    const product = await Beauty.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Beauty product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get Beauty By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// UPDATE BEAUTY
// Vendor ownership required
// ========================================

exports.updateBeauty = async (req, res) => {
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

    const beauty = await Beauty.findOne({
      where: {
        id: req.params.id,
        vendorId: vendor.id,
      },
    });

    if (!beauty) {
      return res.status(404).json({
        success: false,
        message: "Beauty product not found",
      });
    }

    // ========================================
    // STOCK
    // ========================================

    const stockValue =
      req.body.stock !== undefined
        ? Number(req.body.stock)
        : beauty.stock;

    const lowLimit =
      req.body.lowStockLimit !== undefined
        ? Number(req.body.lowStockLimit)
        : beauty.lowStockLimit;

    const criticalLimit =
      req.body.criticalStockLimit !== undefined
        ? Number(req.body.criticalStockLimit)
        : beauty.criticalStockLimit;

    let stockStatus = "In Stock";

    if (stockValue === 0) {
      stockStatus = "Out of Stock";
    } else if (stockValue <= criticalLimit) {
      stockStatus = "Critical Stock";
    } else if (stockValue < lowLimit) {
      stockStatus = "Low Stock";
    }

    // ========================================
    // EXISTING IMAGES
    // ========================================

    let imageUrls = beauty.imageUrls || [];
    let cloudinaryPublicIds =
      beauty.cloudinaryPublicIds || [];

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
                  folder: "shopsphere/beauty",
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

    await beauty.update({
      ...req.body,

      // Never allow vendorId from request body
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
      message: "Beauty product updated successfully",
      data: beauty,
    });
  } catch (error) {
    console.error("Update Beauty Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// DELETE BEAUTY
// Vendor ownership required
// ========================================

exports.deleteBeauty = async (req, res) => {
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

    const beauty = await Beauty.findOne({
      where: {
        id: req.params.id,
        vendorId: vendor.id,
      },
    });

    if (!beauty) {
      return res.status(404).json({
        success: false,
        message: "Beauty product not found",
      });
    }

    // ========================================
    // DELETE CLOUDINARY IMAGES
    // ========================================

    if (beauty.cloudinaryPublicIds) {
      for (const publicId of beauty.cloudinaryPublicIds) {
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }
    }

    // ========================================
    // DELETE DATABASE RECORD
    // ========================================

    await beauty.destroy();

    return res.status(200).json({
      success: true,
      message: "Beauty product deleted successfully",
    });
  } catch (error) {
    console.error("Delete Beauty Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};