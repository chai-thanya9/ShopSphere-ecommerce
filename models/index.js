const User = require("./Users");
const Vendor = require("./Vendor");
const Books = require("./Books");
const Fashion = require("./Fashion");
const Electronics = require("./Electronics");
const Beauty = require("./Beauty");
const Home = require("./Home");
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

Vendor.hasMany(Electronics, {
  foreignKey: "vendorId",
  as: "electronics",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Electronics.belongsTo(Vendor, {
  foreignKey: "vendorId",
  as: "vendor",
});

// One Vendor → Many Beauty Products
Vendor.hasMany(Beauty, {
  foreignKey: "vendorId",
  as: "beautyProducts",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Beauty.belongsTo(Vendor, {
  foreignKey: "vendorId",
  as: "vendor",
});

Vendor.hasMany(Home, {
  foreignKey: "vendorId",
  as: "homeProducts",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Home.belongsTo(Vendor, {
  foreignKey: "vendorId",
  as: "vendor",
});


module.exports = {
  User,
  Vendor,
  Books,
  Fashion,
  Home,
  Orders,
  OrderItems,
  Electronics,
  Beauty
};
  