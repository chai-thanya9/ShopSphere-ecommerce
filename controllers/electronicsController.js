const Electronics = require("../models/Electronics");
const Vendor = require("../models/Vendor");
const cloudinary = require("../config/cloudinary");

// ========================================
// CREATE ELECTRONICS
// ========================================

exports.createElectronics = async (req, res) => {
  try {
    const {
      productName,
      brandName,
      category,
      modelNumber,
      description,
      specifications,
      mrp,
      sellingPrice,
      discountPercentage,
      stock,
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

    let stockStatus = "In Stock";

    if (stockValue === 0) {
      stockStatus = "Out of Stock";
    } else if (stockValue < 20) {
      stockStatus = "Low Stock";
    }

    // ========================================
    // CLOUDINARY IMAGES
    // ========================================

        const images = [];
        const cloudinaryPublicIds = [];
    
        if (req.files && req.files.length > 0) {
    
          for (const file of req.files) {
            const uploadResult = await new Promise(
              (resolve, reject) => {
                const stream =
                  cloudinary.uploader.upload_stream(
                    {
                      folder: "shopsphere/electronics",
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
            images.push(
              uploadResult.secure_url
            );
    
            // Add Cloudinary public ID
            cloudinaryPublicIds.push(
              uploadResult.public_id
            );
          }
        }

    // ========================================
    // SPECIFICATIONS
    // ========================================

    let specificationsValue = specifications || {};

    if (typeof specifications === "string") {
      specificationsValue = JSON.parse(specifications);
    }

    // ========================================
    // CREATE PRODUCT
    // ========================================

    const electronics = await Electronics.create({
      vendorId: vendor.id,

      productName,
      brandName,
      category,
      modelNumber,
      description,

      specifications: specificationsValue,

      mrp,
      sellingPrice,
      discountPercentage,

      stock: stockValue,
      stockStatus,

      images,
      cloudinaryPublicIds,
    });

    return res.status(201).json({
      success: true,
      message: "Electronics product created successfully",
      data: electronics,
    });
  } catch (error) {
    console.error("Create Electronics Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// GET ALL ELECTRONICS
// ========================================

exports.getAllElectronics = async (req, res) => {
  try {
    const electronics = await Electronics.findAll({
      include: [
        {
          model: Vendor,
          as: "vendor",
          attributes: ["shopName", "vendorName"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: electronics.length,
      data: electronics,
    });
  } catch (error) {
    console.error("Get Electronics Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// GET ELECTRONICS BY ID
// ========================================

exports.getElectronicsById = async (req, res) => {
  try {
    const electronics = await Electronics.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: Vendor,
          as: "vendor",
          attributes: ["shopName", "vendorName"],
        },
      ],
    });

    if (!electronics) {
      return res.status(404).json({
        success: false,
        message: "Electronics product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: electronics,
    });
  } catch (error) {
    console.error("Get Electronics By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// UPDATE ELECTRONICS - PUT
// ========================================

exports.updateElectronics = async (req, res) => {
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

    const electronics = await Electronics.findOne({
      where: {
        id: req.params.id,
        vendorId: vendor.id,
      },
    });

    if (!electronics) {
      return res.status(404).json({
        success: false,
        message: "Electronics product not found",
      });
    }

    // ========================================
    // STOCK
    // ========================================

    const stockValue =
      req.body.stock !== undefined
        ? Number(req.body.stock)
        : electronics.stock;

    let stockStatus = "In Stock";

    if (stockValue === 0) {
      stockStatus = "Out of Stock";
    } else if (stockValue < 20) {
      stockStatus = "Low Stock";
    }

    // ========================================
    // IMAGES
    // ========================================

    let images = electronics.images || [];
    let cloudinaryPublicIds =
      electronics.cloudinaryPublicIds || [];

    if (req.files && req.files.length > 0) {
      // Delete old images
      for (const publicId of cloudinaryPublicIds) {
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      images = [];
      cloudinaryPublicIds = [];

      // Upload new images
      for (const file of req.files) {
        const uploadResult = await new Promise(
          (resolve, reject) => {
            const stream =
              cloudinary.uploader.upload_stream(
                {
                  folder: "shopsphere/electronics",
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

        images.push(uploadResult.secure_url);
        cloudinaryPublicIds.push(
          uploadResult.public_id
        );
      }
    }

    // ========================================
    // SPECIFICATIONS
    // ========================================

    let specificationsValue =
      electronics.specifications || {};

    if (req.body.specifications !== undefined) {
      specificationsValue =
        typeof req.body.specifications === "string"
          ? JSON.parse(req.body.specifications)
          : req.body.specifications;
    }

    // ========================================
    // UPDATE
    // ========================================

    await electronics.update({
      ...req.body,

      vendorId: vendor.id,

      stock: stockValue,
      stockStatus,

      specifications: specificationsValue,

      images,
      cloudinaryPublicIds,
    });

    return res.status(200).json({
      success: true,
      message: "Electronics product updated successfully",
      data: electronics,
    });
  } catch (error) {
    console.error("Update Electronics Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// PATCH ELECTRONICS
// ========================================

exports.patchElectronics = async (req, res) => {
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

    const electronics = await Electronics.findOne({
      where: {
        id: req.params.id,
        vendorId: vendor.id,
      },
    });

    if (!electronics) {
      return res.status(404).json({
        success: false,
        message: "Electronics product not found",
      });
    }

    // ========================================
    // STOCK
    // ========================================

    const stockValue =
      req.body.stock !== undefined
        ? Number(req.body.stock)
        : electronics.stock;

    let stockStatus = "In Stock";

    if (stockValue === 0) {
      stockStatus = "Out of Stock";
    } else if (stockValue < 20) {
      stockStatus = "Low Stock";
    }

    // ========================================
    // IMAGE UPDATE
    // ========================================

    let images = electronics.images || [];
    let cloudinaryPublicIds =
      electronics.cloudinaryPublicIds || [];

    if (req.files && req.files.length > 0) {
      for (const publicId of cloudinaryPublicIds) {
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      images = [];
      cloudinaryPublicIds = [];

      for (const file of req.files) {
        const uploadResult = await new Promise(
          (resolve, reject) => {
            const stream =
              cloudinary.uploader.upload_stream(
                {
                  folder: "shopsphere/electronics",
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

        images.push(uploadResult.secure_url);
        cloudinaryPublicIds.push(
          uploadResult.public_id
        );
      }
    }

    // ========================================
    // SPECIFICATIONS
    // ========================================

    let specificationsValue =
      electronics.specifications || {};

    if (req.body.specifications !== undefined) {
      specificationsValue =
        typeof req.body.specifications === "string"
          ? JSON.parse(req.body.specifications)
          : req.body.specifications;
    }

    // ========================================
    // PATCH
    // ========================================

    await electronics.update({
      ...req.body,

      vendorId: vendor.id,

      stock: stockValue,
      stockStatus,

      specifications: specificationsValue,

      images,
      cloudinaryPublicIds,
    });

    return res.status(200).json({
      success: true,
      message: "Electronics product updated successfully",
      data: electronics,
    });
  } catch (error) {
    console.error("Patch Electronics Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// DELETE ELECTRONICS
// ========================================

exports.deleteElectronics = async (req, res) => {
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

    const electronics = await Electronics.findOne({
      where: {
        id: req.params.id,
        vendorId: vendor.id,
      },
    });

    if (!electronics) {
      return res.status(404).json({
        success: false,
        message: "Electronics product not found",
      });
    }

    // ========================================
    // DELETE CLOUDINARY IMAGES
    // ========================================

    if (electronics.cloudinaryPublicIds) {
      for (const publicId of electronics.cloudinaryPublicIds) {
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }
    }

    // ========================================
    // DELETE DATABASE RECORD
    // ========================================

    await electronics.destroy();

    return res.status(200).json({
      success: true,
      message: "Electronics product deleted successfully",
    });
  } catch (error) {
    console.error("Delete Electronics Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};