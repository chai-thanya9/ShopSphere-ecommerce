// controllers/musicalInstrumentsController.js

const MusicalInstruments = require("../models/MusicalInstruments");
const Vendor = require("../models/Vendor");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");


// ========================================
// CREATE MUSICAL INSTRUMENT
// Vendor only
// ========================================

exports.createMusicalInstrument = async (req, res) => {
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

    // ========================================
    // STOCK STATUS
    // ========================================

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
                  folder: "shopsphere/musical_instruments",
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

    const instrument =
      await MusicalInstruments.create({
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
      message:
        "Musical instrument created successfully",
      data: instrument,
    });
  } catch (error) {
    console.error(
      "Create Musical Instrument Error:",
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
// GET ALL MUSICAL INSTRUMENTS
// Public
// ========================================

exports.getAllMusicalInstruments = async (
  req,
  res
) => {
  try {
    const instruments =
      await MusicalInstruments.findAll({
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
      count: instruments.length,
      data: instruments,
    });
  } catch (error) {
    console.error(
      "Get Musical Instruments Error:",
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
// GET MUSICAL INSTRUMENT BY ID
// Public
// ========================================

exports.getMusicalInstrumentById = async (
  req,
  res
) => {
  try {
    const instrument =
      await MusicalInstruments.findOne({
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

    if (!instrument) {
      return res.status(404).json({
        success: false,
        message:
          "Musical instrument not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: instrument,
    });
  } catch (error) {
    console.error(
      "Get Musical Instrument By ID Error:",
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
// UPDATE MUSICAL INSTRUMENT
// Vendor only
// ========================================

exports.updateMusicalInstrument = async (
  req,
  res
) => {
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

    const instrument =
      await MusicalInstruments.findOne({
        where: {
          id: req.params.id,
          vendorId: vendor.id,
        },
      });

    if (!instrument) {
      return res.status(404).json({
        success: false,
        message:
          "Musical instrument not found",
      });
    }

    // ========================================
    // ALLOWED FIELDS
    // ========================================

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
        instrument[field] = req.body[field];
      }
    });

    // ========================================
    // UPDATE STOCK STATUS
    // ========================================

    const stock = Number(instrument.stock);

    const lowLimit = Number(
      instrument.lowStockLimit
    );

    const criticalLimit = Number(
      instrument.criticalStockLimit
    );

    if (stock === 0) {
      instrument.stockStatus = "Out of Stock";
    } else if (stock < criticalLimit) {
      instrument.stockStatus = "Critical Stock";
    } else if (stock < lowLimit) {
      instrument.stockStatus = "Low Stock";
    } else {
      instrument.stockStatus = "In Stock";
    }

    // ========================================
    // UPDATE IMAGES
    // ========================================

    if (req.files && req.files.length > 0) {
      instrument.imageUrls = req.files.map(
        (file) => file.path
      );

      instrument.cloudinaryPublicIds =
        req.files.map(
          (file) => file.filename
        );
    }

    await instrument.save();

    return res.status(200).json({
      success: true,
      message:
        "Musical instrument updated successfully",
      data: instrument,
    });
  } catch (error) {
    console.error(
      "Update Musical Instrument Error:",
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
// DELETE MUSICAL INSTRUMENT
// Vendor only
// ========================================

exports.deleteMusicalInstrument = async (
  req,
  res
) => {
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

    const instrument =
      await MusicalInstruments.findOne({
        where: {
          id: req.params.id,
          vendorId: vendor.id,
        },
      });

    if (!instrument) {
      return res.status(404).json({
        success: false,
        message:
          "Musical instrument not found",
      });
    }

    await instrument.destroy();

    return res.status(200).json({
      success: true,
      message:
        "Musical instrument deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Musical Instrument Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};