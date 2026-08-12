// utils/sendEmail.js

const nodemailer = require("nodemailer");

// ========================================
// SMTP TRANSPORTER
// ========================================

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ========================================
// SMTP DEBUG
// ========================================

console.log("SMTP CONFIG:", {
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  emailUser: process.env.EMAIL_USER,
});

// ========================================
// VERIFY SMTP CONNECTION
// ========================================

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Connection Error:", error);
  } else {
    console.log("SMTP Server Ready:", success);
  }
});

// ========================================
// SEND EMAIL OTP
// ========================================

const sendEmailOtp = async (email, otp) => {
  await transporter.sendMail({
    from: `"ShopSphere" <${process.env.EMAIL_USER}>`,

    to: email,

    subject: "ShopSphere Email Verification OTP",

    html: `
      <h2>Welcome to ShopSphere</h2>

      <p>Your email verification OTP is:</p>

      <h1 style="color:blue;">
        ${otp}
      </h1>

      <p>
        This OTP is valid for <b>10 minutes</b>.
      </p>

      <p>
        Please do not share this OTP with anyone.
      </p>

      <p>
        Thank you,<br>
        ShopSphere Team
      </p>
    `,
  });
};

// ========================================
// SEND TEMPORARY PASSWORD
// ========================================

const sendTemporaryPassword = async (
  email,
  password
) => {
  await transporter.sendMail({
    from: `"ShopSphere" <${process.env.EMAIL_USER}>`,

    to: email,

    subject: "ShopSphere Vendor Account Password",

    html: `
      <h2>Welcome to ShopSphere</h2>

      <p>
        Your vendor account has been successfully verified.
      </p>

      <p>
        Your temporary password is:
      </p>

      <h2 style="color:blue;">
        ${password}
      </h2>

      <p>
        Please keep this password secure.
      </p>

      <p>
        Thank you,<br>
        ShopSphere Team
      </p>
    `,
  });
};

module.exports = {
  sendEmailOtp,
  sendTemporaryPassword,
};