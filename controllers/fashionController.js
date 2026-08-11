const Fashion = require("../models/Fashion");
const Vendor = require("../models/Vendor");
const cloudinary = require("../config/cloudinary");

// ========================================
// HELPER - PARSE ARRAY
// ========================================

const parseArray = (value) => {
  if (value === undefined || value === null) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    // Ignore JSON parse error
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

// ========================================
// HELPER - PARSE JSON
// ========================================

const parseJSON = (value) => {
  if (!value) {
    return {};
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return {};
  }
};

// ========================================
// HELPER - STOCK STATUS
// ========================================

const getStockStatus = (
  stock,
  lowStockLimit = 10,
  criticalStockLimit = 5
) => {
  if (stock === 0) {
    return "Out of Stock";
  }

  if (stock <= criticalStockLimit) {
    return `Only ${stock} Left`;
  }

  if (stock <= lowStockLimit) {
    return "Limited Stock";
  }

  return "In Stock";
};

// ========================================
// HELPER - UPLOAD IMAGES
// ========================================

const uploadImagesToCloudinary = async (files) => {
  const imageUrls = [];
  const cloudinaryPublicIds = [];

  if (!files || files.length === 0) {
    return {
      imageUrls,
      cloudinaryPublicIds,
    };
  }

  for (const file of files) {
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "shopsphere/fashion",
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

  return {
    imageUrls,
    cloudinaryPublicIds,
  };
};

// ========================================
// CREATE FASHION PRODUCT
// ========================================

exports.createFashion = async (req, res) => {
  try {
    const {
      productName,
      brandName,
      category,
      subCategory,
      productDescription,
      material,
      fabric,
      pattern,
      fitType,
      occasion,
      mrp,
      sellingPrice,
      discountPercentage,
      stock,
      lowStockLimit,
      criticalStockLimit,
      sizes,
      sizeChart,
      colors,
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
    // STOCK
    // ========================================

    const stockValue = Number(stock);

    const lowLimit =
      lowStockLimit !== undefined
        ? Number(lowStockLimit)
        : 10;

    const criticalLimit =
      criticalStockLimit !== undefined
        ? Number(criticalStockLimit)
        : 5;

    const stockStatus = getStockStatus(
      stockValue,
      lowLimit,
      criticalLimit
    );

    // ========================================
    // MULTIPLE IMAGES
    // ========================================

    const {
      imageUrls,
      cloudinaryPublicIds,
    } = await uploadImagesToCloudinary(req.files);

    // ========================================
    // CREATE PRODUCT
    // ========================================

    const fashion = await Fashion.create({
      vendorId: vendor.id,

      productName,
      brandName,
      category,
      subCategory,
      productDescription,

      material,
      fabric,
      pattern,
      fitType,
      occasion,

      sizes: parseArray(sizes),
      sizeChart: parseJSON(sizeChart),
      colors: parseArray(colors),

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
      message: "Fashion Product Added Successfully",
      data: fashion,
    });
  } catch (error) {
    console.error("Create Fashion Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// GET ALL FASHION PRODUCTS
// ========================================

exports.getAllFashion = async (req, res) => {
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

    const fashionProducts = await Fashion.findAll({
      where: {
        vendorId: vendor.id,
      },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: fashionProducts.length,
      data: fashionProducts,
    });
  } catch (error) {
    console.error("Get Fashion Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// GET FASHION PRODUCT BY ID
// ========================================

exports.getFashionById = async (req, res) => {
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

    const fashion = await Fashion.findOne({
      where: {
        id: req.params.id,
        vendorId: vendor.id,
      },
    });

    if (!fashion) {
      return res.status(404).json({
        success: false,
        message: "Fashion product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: fashion,
    });
  } catch (error) {
    console.error("Get Fashion By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// UPDATE FASHION PRODUCT
// ========================================

exports.updateFashion = async (req, res) => {
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

    const fashion = await Fashion.findOne({
      where: {
        id: req.params.id,
        vendorId: vendor.id,
      },
    });

    if (!fashion) {
      return res.status(404).json({
        success: false,
        message: "Fashion product not found",
      });
    }

    // ========================================
    // STOCK
    // ========================================

    const stockValue =
      req.body.stock !== undefined
        ? Number(req.body.stock)
        : fashion.stock;

    const lowLimit =
      req.body.lowStockLimit !== undefined
        ? Number(req.body.lowStockLimit)
        : fashion.lowStockLimit;

    const criticalLimit =
      req.body.criticalStockLimit !== undefined
        ? Number(req.body.criticalStockLimit)
        : fashion.criticalStockLimit;

    const stockStatus = getStockStatus(
      stockValue,
      lowLimit,
      criticalLimit
    );

    // ========================================
    // OLD IMAGES
    // ========================================

    let imageUrls = fashion.imageUrls || [];
    let cloudinaryPublicIds =
      fashion.cloudinaryPublicIds || [];

    // ========================================
    // NEW IMAGES UPLOADED
    // ========================================

    if (req.files && req.files.length > 0) {
      // Delete old Cloudinary images
      for (const publicId of cloudinaryPublicIds) {
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      // Upload new images
      const uploaded = await uploadImagesToCloudinary(
        req.files
      );

      imageUrls = uploaded.imageUrls;
      cloudinaryPublicIds =
        uploaded.cloudinaryPublicIds;
    }

    // ========================================
    // UPDATE
    // ========================================

    const updateData = {
      productName:
        req.body.productName !== undefined
          ? req.body.productName
          : fashion.productName,

      brandName:
        req.body.brandName !== undefined
          ? req.body.brandName
          : fashion.brandName,

      category:
        req.body.category !== undefined
          ? req.body.category
          : fashion.category,

      subCategory:
        req.body.subCategory !== undefined
          ? req.body.subCategory
          : fashion.subCategory,

      productDescription:
        req.body.productDescription !== undefined
          ? req.body.productDescription
          : fashion.productDescription,

      material:
        req.body.material !== undefined
          ? req.body.material
          : fashion.material,

      fabric:
        req.body.fabric !== undefined
          ? req.body.fabric
          : fashion.fabric,

      pattern:
        req.body.pattern !== undefined
          ? req.body.pattern
          : fashion.pattern,

      fitType:
        req.body.fitType !== undefined
          ? req.body.fitType
          : fashion.fitType,

      occasion:
        req.body.occasion !== undefined
          ? req.body.occasion
          : fashion.occasion,

      sizes:
        req.body.sizes !== undefined
          ? parseArray(req.body.sizes)
          : fashion.sizes,

      sizeChart:
        req.body.sizeChart !== undefined
          ? parseJSON(req.body.sizeChart)
          : fashion.sizeChart,

      colors:
        req.body.colors !== undefined
          ? parseArray(req.body.colors)
          : fashion.colors,

      mrp:
        req.body.mrp !== undefined
          ? req.body.mrp
          : fashion.mrp,

      sellingPrice:
        req.body.sellingPrice !== undefined
          ? req.body.sellingPrice
          : fashion.sellingPrice,

      discountPercentage:
        req.body.discountPercentage !== undefined
          ? req.body.discountPercentage
          : fashion.discountPercentage,

      stock: stockValue,
      lowStockLimit: lowLimit,
      criticalStockLimit: criticalLimit,
      stockStatus,

      imageUrls,
      cloudinaryPublicIds,

      // Never accept vendorId from request
      vendorId: vendor.id,
    };

    await fashion.update(updateData);

    return res.status(200).json({
      success: true,
      message: "Fashion Product Updated Successfully",
      data: fashion,
    });
  } catch (error) {
    console.error("Update Fashion Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// DELETE FASHION PRODUCT
// ========================================

exports.deleteFashion = async (req, res) => {
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

    const fashion = await Fashion.findOne({
      where: {
        id: req.params.id,
        vendorId: vendor.id,
      },
    });

    if (!fashion) {
      return res.status(404).json({
        success: false,
        message: "Fashion product not found",
      });
    }

    // ========================================
    // DELETE CLOUDINARY IMAGES
    // ========================================

    if (fashion.cloudinaryPublicIds) {
      for (const publicId of fashion.cloudinaryPublicIds) {
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }
    }

    // ========================================
    // DELETE DATABASE RECORD
    // ========================================

    await fashion.destroy();

    return res.status(200).json({
      success: true,
      message: "Fashion Product Deleted Successfully",
    });
  } catch (error) {
    console.error("Delete Fashion Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};