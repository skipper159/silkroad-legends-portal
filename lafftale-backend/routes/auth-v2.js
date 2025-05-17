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

// Registrierung
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Passwort vergessen
router.post("/forgot-password", forgotPassword);

// Passwort-Reset-Token überprüfen
router.get("/verify-reset-token/:token", verifyResetToken);

// Passwort zurücksetzen
router.post("/reset-password", resetPassword);

// E-Mail verifizieren
router.get("/verify-email/:token", verifyEmail);

// Verifizierungs-E-Mail erneut senden
router.post("/resend-verification", resendVerificationEmail);

module.exports = router;
