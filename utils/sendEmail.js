// utils/sendEmail.js
const nodemailer = require("nodemailer");

const sendEmailOtp = async (email, otp) => {
  try {
    const response = await fetch(
      "https://api.brevo.com/v3/smtp/email",
      {
        method: "POST",

        headers: {
          accept: "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },

        body: JSON.stringify({
          sender: {
            name: process.env.BREVO_SENDER_NAME || "ShopSphere",
            email: process.env.BREVO_SENDER_EMAIL,
          },

          to: [
            {
              email: email,
            },
          ],

          subject: "ShopSphere Email Verification OTP",

          htmlContent: `
            <div>
              <h2>Welcome to ShopSphere</h2>

              <p>Your email verification OTP is:</p>

              <h1>${otp}</h1>

              <p>This OTP is valid for <b>10 minutes</b>.</p>

              <p>Please do not share this OTP with anyone.</p>

              <p>Thank you,<br>
              ShopSphere Team</p>
            </div>
          `,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Brevo API Error:", data);

      throw new Error(
        data.message || "Brevo email sending failed"
      );
    }

    console.log("OTP email sent successfully:", data);

    return data;

  } catch (error) {
    console.error("Brevo Email Error:", error);

    throw error;
  }
};


// ========================================
// TEMPORARY PASSWORD
// ========================================

const sendTemporaryPassword = async (
  email,
  password
) => {
  try {
    const response = await fetch(
      "https://api.brevo.com/v3/smtp/email",
      {
        method: "POST",

        headers: {
          accept: "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },

        body: JSON.stringify({
          sender: {
            name: process.env.BREVO_SENDER_NAME || "ShopSphere",
            email: process.env.BREVO_SENDER_EMAIL,
          },

          to: [
            {
              email: email,
            },
          ],

          subject: "ShopSphere Vendor Account Password",

          htmlContent: `
            <div>
              <h2>Welcome to ShopSphere</h2>

              <p>Your vendor account has been successfully verified.</p>

              <p>Your temporary password is:</p>

              <h2>${password}</h2>

              <p>Please keep this password secure.</p>

              <p>Thank you,<br>
              ShopSphere Team</p>
            </div>
          `,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Brevo API Error:", data);

      throw new Error(
        data.message || "Brevo email sending failed"
      );
    }

    console.log(
      "Temporary password email sent successfully:",
      data
    );

    return data;

  } catch (error) {
    console.error(
      "Brevo Temporary Password Error:",
      error
    );

    throw error;
  }
};


module.exports = {
  sendEmailOtp,
  sendTemporaryPassword,
};