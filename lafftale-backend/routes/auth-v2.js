const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  verifyEmail,
  resendVerificationEmail
} = require("../controllers/authController");

// Registration
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Verify password reset token
router.get("/verify-reset-token/:token", verifyResetToken);

// Reset password
router.post("/reset-password", resetPassword);

// Verify email
router.get("/verify-email/:token", verifyEmail);

// Resend verification email
router.post("/resend-verification", resendVerificationEmail);

module.exports = router;
