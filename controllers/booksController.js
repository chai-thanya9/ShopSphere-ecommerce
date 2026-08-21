const Books = require("../models/Books");
const Vendor = require("../models/Vendor");
const cloudinary = require("../config/cloudinary");

// ========================================
// CREATE BOOK
// ========================================
exports.createBook = async (req, res) => {
  try {
    const {
      title,
      bookType,
      titleDescription,
      authorName,
      publisher,
      publicationDate,
      edition,
      language,
      pages,
      format,
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

    const vendorId = vendor.id;

    // ========================================
    // STOCK
    // ========================================

    const stockValue = Number(stock);

    let stockStatus = "In Stock";

    if (stockValue === 0) {
      stockStatus = "Out of Stock";
    } else if (stockValue < 5) {
      stockStatus = "Critical Stock";
    } else if (stockValue < 10) {
      stockStatus = "Low Stock";
    }

    // ========================================
    // MULTIPLE CLOUDINARY IMAGES
    // ========================================

    const coverImages = [];
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
        coverImages.push(
          uploadResult.secure_url
        );

        // Add Cloudinary public ID
        cloudinaryPublicIds.push(
          uploadResult.public_id
        );
      }
    }

    // ========================================
    // CHECK IMAGE DATA BEFORE DATABASE
    // ========================================
    // ========================================
    // CREATE BOOK
    // ========================================

    const book = await Books.create({
      vendorId,

      title,
      bookType,
      titleDescription,
      authorName,
      publisher,
      publicationDate,
      edition,
      language,
      pages,
      format,

      mrp,
      sellingPrice,
      discountPercentage,

      stock: stockValue,
      stockStatus,

      coverImages,
      cloudinaryPublicIds,
    });

    return res.status(201).json({
      success: true,
      message: "Book Added Successfully",
      data: book,
    });
  } catch (error) {
    console.error("Create Book Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// GET ALL BOOKS
// ========================================
exports.getAllBooks = async (req, res) => {
  try {

    const books = await Books.findAll({
    include: [
        {
          model: Vendor, 
          as: "vendor",   
        attributes: ["shopName", "vendorName"],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    console.error("Get Books Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// GET BOOK BY ID
// ========================================
exports.getBookById = async (req, res) => {
  try {
    const book = await Books.findOne({
      where: {
        id: req.params.id,
        // vendorId: vendor.id,
      },
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    console.error("Get Book Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// UPDATE BOOK
// ========================================
exports.updateBook = async (req, res) => {
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

    const book = await Books.findOne({
      where: {
        id: req.params.id,
        vendorId: vendor.id,
      },
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // ========================================
    // STOCK
    // ========================================

    const stockValue =
      req.body.stock !== undefined
        ? Number(req.body.stock)
        : book.stock;

    let stockStatus = "In Stock";

    if (stockValue === 0) {
      stockStatus = "Out of Stock";
    } else if (stockValue < 5) {
      stockStatus = "Critical Stock";
    } else if (stockValue < 10) {
      stockStatus = "Low Stock";
    }

    // ========================================
    // EXISTING IMAGES
    // ========================================

    let coverImages = book.coverImages || [];
    let cloudinaryPublicIds = book.cloudinaryPublicIds || [];

    // ========================================
    // NEW IMAGES
    // ========================================

    if (req.files && req.files.length > 0) {
      // Delete old Cloudinary images
      for (const publicId of cloudinaryPublicIds) {
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      // Reset arrays
      coverImages = [];
      cloudinaryPublicIds = [];

      // Upload new images
      for (const file of req.files) {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "shopsphere/books",
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

        coverImages.push(uploadResult.secure_url);
        cloudinaryPublicIds.push(uploadResult.public_id);
      }
    }

    // ========================================
    // UPDATE BOOK
    // ========================================

    await book.update({
      title: req.body.title,
      bookType: req.body.bookType,
      titleDescription: req.body.titleDescription,
      authorName: req.body.authorName,
      publisher: req.body.publisher,
      publicationDate: req.body.publicationDate,
      edition: req.body.edition,
      language: req.body.language,
      pages: req.body.pages,
      format: req.body.format,

      mrp: req.body.mrp,
      sellingPrice: req.body.sellingPrice,
      discountPercentage: req.body.discountPercentage,

      stock: stockValue,
      stockStatus,

      status: req.body.status,

      vendorId: vendor.id,

      coverImages,
      cloudinaryPublicIds,
    });

    return res.status(200).json({
      success: true,
      message: "Book Updated Successfully",
      data: book,
    });
  } catch (error) {
    console.error("Update Book Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ========================================
// DELETE BOOK
// ========================================
exports.deleteBook = async (req, res) => {
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

    const book = await Books.findOne({
      where: {
        id: req.params.id,
        vendorId: vendor.id,
      },
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // ========================================
    // DELETE CLOUDINARY IMAGES
    // ========================================

    if (
      book.cloudinaryPublicIds &&
      book.cloudinaryPublicIds.length > 0
    ) {
      for (const publicId of book.cloudinaryPublicIds) {
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }
    }

    // ========================================
    // DELETE BOOK
    // ========================================

    await book.destroy();

    return res.status(200).json({
      success: true,
      message: "Book Deleted Successfully",
    });
  } catch (error) {
    console.error("Delete Book Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};