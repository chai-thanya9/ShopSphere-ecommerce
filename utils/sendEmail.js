const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send OTP
const sendEmailOtp = async (email, otp) => {
  await transporter.sendMail({
    from: `"ShopSphere" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "ShopSphere Vendor Verification OTP",
    html: `
      <h2>Welcome to ShopSphere</h2>

      <p>Your verification OTP is:</p>

      <h1 style="color:blue;">${otp}</h1>

      <p>This OTP is valid for <b>10 minutes</b>.</p>

      <p>Please do not share this OTP with anyone.</p>
    `,
  });
};


// Send Temporary Password
const sendTemporaryPassword = async (email, password) => {
  await transporter.sendMail({
    from: `"ShopSphere" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "ShopSphere Vendor Account Password",
    html: `
      <h2>Welcome to ShopSphere</h2>

      <p>Your vendor account has been successfully verified.</p>

      <p>Your temporary password is:</p>

      <h2 style="color:blue;">${password}</h2>

      <p>
        Please keep this password secure and do not share it with anyone.
      </p>

      <p>
        Use your registered email and this password to login.
      </p>

      <p>Thank you,<br>ShopSphere Team</p>
    `,
  });
};


module.exports = {
  sendEmailOtp,
  sendTemporaryPassword,
};