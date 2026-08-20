const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

   

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header is missing",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization must use Bearer token",
      });
    }

    const token = authHeader.split(" ")[1];

    console.log("TOKEN RECEIVED:", !!token);

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("DECODED TOKEN:", decoded);

    // Store authenticated user
    req.user = {
      id: decoded.id,
      vendorId: decoded.vendorId,
      email: decoded.email,
      role: decoded.role,
    };

    console.log("REQ.USER:", req.user);

    next();

  } catch (error) {
    console.error("AUTH ERROR:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = authenticate;``