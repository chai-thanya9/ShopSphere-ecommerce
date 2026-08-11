const bcrypt = require("bcryptjs");

const admin = {
  id: "admin-001",
  firstName: "fusion",
  lastName: "evalx",
  email: "fusionevalx@gmail.com",
  password: bcrypt.hashSync("Qazxswedc@@99", 10),
  role: "Admin",
};

module.exports = admin;