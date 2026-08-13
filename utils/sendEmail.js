// // utils/sendEmail.js
const nodemailer = require("nodemailer");
const axios = require("axios");


// const sendEmailOtp = async (email, otp) => {
//   try {
//     const response = await fetch(
//       "https://api.brevo.com/v3/smtp/email",
//       {
//         method: "POST",

//         headers: {
//           accept: "application/json",
//           "api-key": process.env.BREVO_API_KEY,
//           "content-type": "application/json",
//         },

//         body: JSON.stringify({
//           sender: {
//             name: process.env.BREVO_SENDER_NAME || "ShopSphere",
//             email: process.env.BREVO_SENDER_EMAIL,
//           },

//           to: [
//             {
//               email: email,
//             },
//           ],

//           subject: "ShopSphere Email Verification OTP",

//           htmlContent: `
//             <div>
//               <h2>Welcome to ShopSphere</h2>

//               <p>Your email verification OTP is:</p>

//               <h1>${otp}</h1>

//               <p>This OTP is valid for <b>10 minutes</b>.</p>

//               <p>Please do not share this OTP with anyone.</p>

//               <p>Thank you,<br>
//               ShopSphere Team</p>
//             </div>
//           `,
//         }),
//       }
//     );

//     const data = await response.json();

//     if (!response.ok) {
//       console.error("Brevo API Error:", data);

//       throw new Error(
//         data.message || "Brevo email sending failed"
//       );
//     }

//     console.log("OTP email sent successfully:", data);

//     return data;

//   } catch (error) {
//     console.error("Brevo Email Error:", error);

//     throw error;
//   }
// };


// // ========================================
// // TEMPORARY PASSWORD
// // ========================================

// const sendTemporaryPassword = async (
//   email,
//   password
// ) => {
//   try {
//     const response = await fetch(
//       "https://api.brevo.com/v3/smtp/email",
//       {
//         method: "POST",

//         headers: {
//           accept: "application/json",
//           "api-key": process.env.BREVO_API_KEY,
//           "content-type": "application/json",
//         },

//         body: JSON.stringify({
//           sender: {
//             name: process.env.BREVO_SENDER_NAME || "ShopSphere",
//             email: process.env.BREVO_SENDER_EMAIL,
//           },

//           to: [
//             {
//               email: email,
//             },
//           ],

//           subject: "ShopSphere Vendor Account Password",

//           htmlContent: `
//             <div>
//               <h2>Welcome to ShopSphere</h2>

//               <p>Your vendor account has been successfully verified.</p>

//               <p>Your temporary password is:</p>

//               <h2>${password}</h2>

//               <p>Please keep this password secure.</p>

//               <p>Thank you,<br>
//               ShopSphere Team</p>
//             </div>
//           `,
//         }),
//       }
//     );

//     const data = await response.json();

//     if (!response.ok) {
//       console.error("Brevo API Error:", data);

//       throw new Error(
//         data.message || "Brevo email sending failed"
//       );
//     }

//     console.log(
//       "Temporary password email sent successfully:",
//       data
//     );

//     return data;

//   } catch (error) {
//     console.error(
//       "Brevo Temporary Password Error:",
//       error
//     );

//     throw error;
//   }
// };


// module.exports = {
//   sendEmailOtp,
//   sendTemporaryPassword,
// };

// utils/sendEmail.js

// ========================================
// SEND VENDOR REGISTRATION EMAIL
// ========================================

const sendVendorRegistrationEmail = async ({
  email,
  vendorName,
  businessType,
  shopName,
  mobileNumber,
  otp,
  temporaryPassword,
}) => {
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
            name:
              process.env.BREVO_SENDER_NAME ||
              "ShopSphere",

            email:
              process.env.BREVO_SENDER_EMAIL,
          },

          to: [
            {
              email,
            },
          ],

          subject:
            "ShopSphere Vendor Registration Completed",

          htmlContent: `
            <html>
              <body>

                <h2>Welcome to ShopSphere!</h2>

                <p>
                  Your vendor registration has been
                  completed successfully by the ShopSphere
                  Admin.
                </p>

                <hr />

                <h3>Vendor Information</h3>

                <p>
                  <b>Vendor Name:</b>
                  ${vendorName}
                </p>

                <p>
                  <b>Business Type:</b>
                  ${businessType}
                </p>

                <p>
                  <b>Shop Name:</b>
                  ${shopName}
                </p>

                <p>
                  <b>Mobile Number:</b>
                  ${mobileNumber}
                </p>

                <hr />

                <h3>Login Information</h3>

                <p>
                  <b>Email:</b>
                  ${email}
                </p>

                <p>
                  <b>Temporary Password:</b>
                  ${temporaryPassword}
                </p>

                <hr />

                <h3>Email Verification OTP</h3>

                <h1 style="color: blue;">
                  ${otp}
                </h1>

                <p>
                  This OTP is valid for
                  <b>10 minutes</b>.
                </p>

                <p>
                  Please do not share your OTP or
                  password with anyone.
                </p>

                <hr />

                <p>
                  Thank you,<br />
                  <b>ShopSphere Team</b>
                </p>

              </body>
            </html>
          `,
        }),
      }
    );

    const responseText = await response.text();

    console.log(
      "Brevo Status:",
      response.status
    );

    console.log(
      "Brevo Response:",
      responseText
    );

    if (!response.ok) {
      throw new Error(
        `Brevo API ${response.status}: ${responseText}`
      );
    }

    console.log(
      "Vendor registration email sent successfully"
    );

    return JSON.parse(responseText);

  } catch (error) {
    console.error(
      "Vendor Registration Email Error:",
      error
    );

    throw error;
  }
};



// ========================================
// SEND CUSTOMER OTP EMAIL
// ========================================

const sendCustomerOtpEmail = async (email, otp) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "ShopSphere",
          email: process.env.BREVO_SENDER_EMAIL,
        },

        to: [
          {
            email: email,
          },
        ],

        subject: "ShopSphere Email Verification OTP",

        htmlContent: `
          <h2>Welcome to ShopSphere</h2>

          <p>Your email verification OTP is:</p>

          <h1>${otp}</h1>

          <p>This OTP is valid for <b>10 minutes</b>.</p>

          <p>Please do not share this OTP with anyone.</p>

          <p>Thank you,<br>ShopSphere Team</p>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      "Customer OTP Email Sent:",
      response.data
    );

    return response.data;

  } catch (error) {
    console.error(
      "Brevo API Error:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.message ||
      error.message
    );
  }
};


module.exports = {
  sendVendorRegistrationEmail,
  sendCustomerOtpEmail,
};