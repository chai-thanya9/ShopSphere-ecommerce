const Appliances = require("../models/Appliances");
const Vendor = require("../models/Vendor");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

const {
  readBulkFile,
} = require("../utils/bulkUpload");
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





// ========================================
// BULK UPLOAD APPLIANCES
// CSV + EXCEL
// ========================================

exports.bulkUploadAppliances = async (req, res) => {
  let filePath = null;

  try {
    // ========================================
    // CHECK FILE
    // ========================================

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "CSV or Excel file is required",
      });
    }

    filePath = req.file.path;

    console.log(
      "Bulk file:",
      req.file.originalname
    );

    // ========================================
    // CHECK AUTHENTICATED USER
    // ========================================

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // ========================================
    // FIND VENDOR
    // ========================================
    // req.user.id = Users_info.id
    // Appliances.vendorId = vendors.id

    const vendor = await Vendor.findOne({
      where: {
        userId: req.user.id,
      },
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor account not found",
      });
    }

    // ========================================
    // CHECK VENDOR STATUS
    // ========================================

    if (vendor.status !== "Approved") {
      return res.status(403).json({
        success: false,
        message:
          "Vendor is not approved to upload products",
        data: {
          vendorId: vendor.id,
          status: vendor.status,
        },
      });
    }

    console.log(
      "Vendor ID:",
      vendor.id
    );

    // ========================================
    // READ CSV / EXCEL FILE
    // ========================================

    const rows = await readBulkFile(
      req.file.path,
      req.file.originalname
    );

    console.log(
      "Total rows:",
      rows.length
    );

    // ========================================
    // CHECK EMPTY FILE
    // ========================================

    if (!rows || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Uploaded file is empty",
      });
    }

    // ========================================
    // ARRAYS
    // ========================================

    const validProducts = [];
    const errors = [];

    // ========================================
    // ALLOWED CATEGORIES
    // ========================================

    const allowedCategories = [
      "Kitchen Appliances",
      "Home Appliances",
      "Cleaning Appliances",
      "Cooling Appliances",
      "Heating Appliances",
      "Personal Care Appliances",
      "Other",
    ];

    // ========================================
    // ALLOWED STATUS
    // ========================================

    const allowedStatuses = [
      "Draft",
      "Pending",
      "Approved",
      "Rejected",
      "Blocked",
    ];

    // ========================================
    // PROCESS EACH ROW
    // ========================================

    rows.forEach((row, index) => {
      const rowNumber = index + 2;

      // ======================================
      // READ CSV VALUES
      // ======================================

      const productName = String(
        row.productName || ""
      ).trim();

      const brandName = String(
        row.brandName || ""
      ).trim();

      const category = String(
        row.category || ""
      ).trim();

      const subCategory = String(
        row.subCategory || ""
      ).trim();

      const productDescription = String(
        row.productDescription || ""
      ).trim();

      const modelNumber = String(
        row.modelNumber || ""
      ).trim();

      const color = String(
        row.color || ""
      ).trim();

      const warranty = String(
        row.warranty || ""
      ).trim();

      const mrp = Number(row.mrp);

      const sellingPrice = Number(
        row.sellingPrice
      );

      const discountPercentage = Number(
        row.discountPercentage || 0
      );

      const stock = Number(row.stock);

      const lowStockLimit = Number(
        row.lowStockLimit || 20
      );

      const criticalStockLimit = Number(
        row.criticalStockLimit || 5
      );

      const status = String(
        row.status || "Pending"
      ).trim();

      // ======================================
      // IMAGE URLS
      // ======================================

      const imageUrls = row.imageUrls
        ? String(row.imageUrls)
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

      // ======================================
      // CLOUDINARY PUBLIC IDS
      // ======================================

      const cloudinaryPublicIds =
        row.cloudinaryPublicIds
          ? String(row.cloudinaryPublicIds)
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [];

      // ======================================
      // REQUIRED VALIDATION
      // ======================================

      if (!productName) {
        errors.push({
          row: rowNumber,
          message:
            "productName is required",
        });

        return;
      }

      if (!brandName) {
        errors.push({
          row: rowNumber,
          message:
            "brandName is required",
        });

        return;
      }

      if (!category) {
        errors.push({
          row: rowNumber,
          message:
            "category is required",
        });

        return;
      }

      if (!subCategory) {
        errors.push({
          row: rowNumber,
          message:
            "subCategory is required",
        });

        return;
      }

      if (!productDescription) {
        errors.push({
          row: rowNumber,
          message:
            "productDescription is required",
        });

        return;
      }

      // ======================================
      // CATEGORY VALIDATION
      // ======================================

      if (
        !allowedCategories.includes(
          category
        )
      ) {
        errors.push({
          row: rowNumber,
          message:
            `Invalid category. Allowed values: ${allowedCategories.join(
              ", "
            )}`,
        });

        return;
      }

      // ======================================
      // STATUS VALIDATION
      // ======================================

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        errors.push({
          row: rowNumber,
          message:
            `Invalid status. Allowed values: ${allowedStatuses.join(
              ", "
            )}`,
        });

        return;
      }

      // ======================================
      // MRP VALIDATION
      // ======================================

      if (
        !Number.isFinite(mrp) ||
        mrp <= 0
      ) {
        errors.push({
          row: rowNumber,
          message:
            "mrp must be greater than 0",
        });

        return;
      }

      // ======================================
      // SELLING PRICE VALIDATION
      // ======================================

      if (
        !Number.isFinite(
          sellingPrice
        ) ||
        sellingPrice <= 0
      ) {
        errors.push({
          row: rowNumber,
          message:
            "sellingPrice must be greater than 0",
        });

        return;
      }

      if (sellingPrice > mrp) {
        errors.push({
          row: rowNumber,
          message:
            "sellingPrice cannot be greater than mrp",
        });

        return;
      }

      // ======================================
      // DISCOUNT VALIDATION
      // ======================================

      if (
        !Number.isFinite(
          discountPercentage
        ) ||
        discountPercentage < 0 ||
        discountPercentage > 100
      ) {
        errors.push({
          row: rowNumber,
          message:
            "discountPercentage must be between 0 and 100",
        });

        return;
      }

      // ======================================
      // STOCK VALIDATION
      // ======================================

      if (
        !Number.isInteger(stock) ||
        stock < 0
      ) {
        errors.push({
          row: rowNumber,
          message:
            "stock must be a non-negative integer",
        });

        return;
      }

      // ======================================
      // LOW STOCK LIMIT
      // ======================================

      if (
        !Number.isInteger(
          lowStockLimit
        ) ||
        lowStockLimit < 0
      ) {
        errors.push({
          row: rowNumber,
          message:
            "lowStockLimit must be a non-negative integer",
        });

        return;
      }

      // ======================================
      // CRITICAL STOCK LIMIT
      // ======================================

      if (
        !Number.isInteger(
          criticalStockLimit
        ) ||
        criticalStockLimit < 0
      ) {
        errors.push({
          row: rowNumber,
          message:
            "criticalStockLimit must be a non-negative integer",
        });

        return;
      }

      // ======================================
      // STOCK STATUS
      // ======================================

      let stockStatus = "In Stock";

      if (stock === 0) {
        stockStatus = "Out of Stock";
      } else if (
        stock <= criticalStockLimit
      ) {
        stockStatus = "Critical Stock";
      } else if (
        stock <= lowStockLimit
      ) {
        stockStatus = "Low Stock";
      }

      // ======================================
      // ADD VALID PRODUCT
      // ======================================

      validProducts.push({
        // IMPORTANT:
        // Vendor ID comes from authenticated
        // vendor, NOT from CSV.

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

        stock,
        lowStockLimit,
        criticalStockLimit,
        stockStatus,

        imageUrls,
        cloudinaryPublicIds,

        status,
      });
    });

    // ========================================
    // NO VALID PRODUCTS
    // ========================================

    if (
      validProducts.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No valid products found",

        data: {
          totalRows: rows.length,
          successful: 0,
          failed: errors.length,
        },

        errors,
      });
    }

    // ========================================
    // BULK INSERT
    // ========================================

    const createdProducts =
      await Appliances.bulkCreate(
        validProducts,
        {
          validate: true,
        }
      );

    // ========================================
    // SUCCESS RESPONSE
    // ========================================

    return res.status(201).json({
      success: true,

      message:
        "Appliances bulk upload completed",

      data: {
        vendorId: vendor.id,
        vendorName: vendor.vendorName,

        totalRows: rows.length,

        successful:
          createdProducts.length,

        failed: errors.length,
      },

      errors,
    });

  } catch (error) {
    // ========================================
    // ERROR
    // ========================================

    console.error(
      "Appliances Bulk Upload Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Appliances bulk upload failed",

      error: error.message,
    });

  } finally {
    // ========================================
    // DELETE TEMPORARY FILE
    // ========================================

    if (filePath) {
      try {
        await fs.promises.unlink(
          filePath
        );

        console.log(
          "Bulk file deleted:",
          filePath
        );

      } catch (error) {
        if (error.code !== "ENOENT") {
          console.error(
            "File cleanup error:",
            error
          );
        }
      }
    }
  }
}; 