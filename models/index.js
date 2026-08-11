const User = require("./Users");
const Vendor = require("./Vendor");
const Books = require("./Books");
const Fashion = require("./Fashion");
const Orders = require("./Orders");
const OrderItems = require("./OrderItems");

// ========================================
// USER ↔ VENDOR
// ========================================

// One User → One Vendor
User.hasOne(Vendor, {
  foreignKey: "userId",
  as: "vendor",
});

Vendor.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// ========================================
// VENDOR ↔ BOOKS
// ========================================

// One Vendor → Many Books
Vendor.hasMany(Books, {
  foreignKey: "vendorId",
  as: "books",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Books.belongsTo(Vendor, {
  foreignKey: "vendorId",
  as: "vendor",
});

// ========================================
// VENDOR ↔ FASHION
// ========================================

// One Vendor → Many Fashion Products
Vendor.hasMany(Fashion, {
  foreignKey: "vendorId",
  as: "fashionProducts",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// One Fashion Product → One Vendor
Fashion.belongsTo(Vendor, {
  foreignKey: "vendorId",
  as: "vendor",
});

// ========================================
// EXPORT
// ========================================

module.exports = {
  User,
  Vendor,
  Books,
  Fashion,
  Orders,
  OrderItems,
};