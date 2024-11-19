const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto"); // For generating verification token
const nodemailer = require("nodemailer");
const router = express.Router();
const User = require("../models/user"); // Assuming you have a User model

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // Use your preferred service or SMTP settings
  auth: {
    user: process.env.EMAIL, // Your email
    pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
  },
});

// Register a new user
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, password, username } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      emailVerified: false,
      phone,
      username,
      role: "user",
      // verificationToken, // Store the token in the database
      // tokenExpires: Date.now() + 3600000, // Token expiration time (1 hour)
    });

    // Save the user
    await newUser.save();

    // Create verification URL
    const verificationUrl = `${req.protocol}://${req.get("host")}/verify-email?token=${verificationToken}`;

    // Send verification email
    const mailOptions = {
      from: process.env.EMAIL, // Your email
      to: email,
      subject: "Verify Your Email",
      html: `<h3>Hello ${name},</h3>
             <p>Thank you for registering. Please verify your email by clicking the link below:</p>
             <a href="${verificationUrl}">Verify Email</a>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: "User registered successfully. Please check your email for verification." });
  } catch (err) {
    res.status(500).json({ message: "Error registering user", error: err.message });
  }
});

module.exports = router;





// const express = require("express");
// const bcrypt = require("bcrypt");
// const nodemailer = require("nodemailer");
// const jwt = require("jsonwebtoken");
// const router = express.Router();
// const User = require("../models/user"); // Assuming you have a User model

// // Create a transporter for sending emails
// const transporter = nodemailer.createTransport({
//   service: "gmail", // You can use other email providers as well
//   auth: {
//     user: process.env.EMAIL_USERNAME, // Your email address
//     pass: process.env.EMAIL_PASSWORD, // Your email password (use App Password for Gmail)
//   },
// });

// // Register a new user
// router.post("/", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     // Check if the user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create a verification token
//     const emailToken = jwt.sign(
//       { email },
//       process.env.JWT_SECRET, // Secret key for JWT
//       { expiresIn: "1h" } // Token expires in 1 hour
//     );

//     const verificationLink = `http://localhost:8000/api/verify-email?token=${emailToken}`;

//     // Send verification email
//     const mailOptions = {
//       from: process.env.EMAIL_USERNAME,
//       to: email,
//       subject: "Verify your email address",
//       html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`,
//     };

//     transporter.sendMail(mailOptions, (err, info) => {
//       if (err) {
//         console.error("Error sending email: ", err);
//         return res.status(500).json({ message: "Error sending verification email" });
//       }
//       console.log("Verification email sent: ", info.response);
//     });

//     // Create a new user but don't mark email as verified yet
//     const newUser = new User({
//       name,
//       email,
//       password: hashedPassword,
//       email_verified: false, // Set to false initially
//     });

//     // Save the user
//     await newUser.save();

//     res.status(201).json({ message: "User registered successfully, check your email for verification" });
//   } catch (err) {
//     res.status(500).json({ message: "Error registering user", error: err.message });
//   }
// });

// module.exports = router;

