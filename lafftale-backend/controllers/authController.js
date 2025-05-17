
const { pool, poolConnect, sql } = require("../db");
const jwt = require("jsonwebtoken");
const { hashPassword, comparePassword } = require("../utils/hash");
const { generateToken, sendPasswordResetEmail, sendVerificationEmail } = require("../utils/email");

/**
 * Register a new user
 */
async function registerUser(req, res) {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).send("Missing fields");

  const hashedPassword = await hashPassword(password);
  // Token für E-Mail-Verifizierung generieren
  const verificationToken = generateToken();
  const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Stunden gültig
  
  await poolConnect;
    try {
    const role = await pool.request()
      .query("SELECT Id FROM Roles WHERE Name = 'User'");
      
    if (!role.recordset[0]) {
      return res.status(500).send("Role configuration error");
    }

    await pool.request()
      .input("username", sql.NVarChar, username)
      .input("email", sql.NVarChar, email)
      .input("password", sql.NVarChar, hashedPassword)
      .input("roleId", sql.Int, role.recordset[0].Id)
      .input("verificationToken", sql.NVarChar, verificationToken)
      .input("verificationExpiry", sql.DateTime, verificationExpiry)
      .query(`INSERT INTO WebUsers (Username, Email, PasswordHash, RoleId, EmailVerified, VerificationToken, VerificationTokenExpiry) 
              VALUES (@username, @email, @password, @roleId, 0, @verificationToken, @verificationExpiry)`);

    // Verifizierungs-E-Mail senden
    try {
      await sendVerificationEmail(email, verificationToken);
      console.log(`Verification email sent to ${email}`);
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      // Wir geben hier keinen Fehler zurück, um den Registrierungsprozess nicht zu unterbrechen
    }

    res.status(201).send("User registered successfully");
  } catch (err) {
    console.error(err);
    
    if (err.number === 2627) { // SQL Server unique constraint violation
      return res.status(409).send("Username or email already exists");
    }
    
    res.status(500).send("Database error during registration");
  }
}

/**
 * Login a user
 */
async function loginUser(req, res) {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send("Missing fields");

  await poolConnect;
  try {
    const user = await pool.request()
      .input("username", sql.NVarChar, username)
      .query("SELECT * FROM WebUsers WHERE Username = @username OR Email = @username");

    if (!user.recordset[0]) return res.status(404).send("User not found");

    const valid = await comparePassword(password, user.recordset[0].PasswordHash);
    if (!valid) return res.status(403).send("Invalid credentials");

    // Prüfen, ob der Benutzer die E-Mail-Adresse bestätigt hat
    if (!user.recordset[0].EmailVerified) {
      // Optional: Hier könnte eine neue Bestätigungs-E-Mail ausgelöst werden, falls die alte abgelaufen ist
      return res.status(403).send({
        message: "Email nicht verifiziert",
        needsVerification: true
      });
    }

    // Update last login time
    await pool.request()
      .input("userId", sql.Int, user.recordset[0].Id)
      .input("now", sql.DateTime, new Date())
      .query("UPDATE WebUsers SET LastLogin = @now WHERE Id = @userId");

    const token = jwt.sign(
      { 
        id: user.recordset[0].Id, 
        role: user.recordset[0].RoleId,
        username: user.recordset[0].Username
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );
    
    res.json({ 
      token,
      user: {
        id: user.recordset[0].Id,
        username: user.recordset[0].Username,
        email: user.recordset[0].Email,
        role: user.recordset[0].RoleId
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Login error");
  }
}

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  verifyEmail,
  resendVerificationEmail
};

/**
 * Passwort vergessen - Sendet eine E-Mail mit einem Passwort-Reset-Link
 */
async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).send("Email is required");

  try {
    await poolConnect;
    
    // Prüfen, ob der Benutzer mit dieser E-Mail existiert
    const user = await pool.request()
      .input("email", sql.NVarChar, email)
      .query("SELECT * FROM WebUsers WHERE Email = @email");
    
    if (!user.recordset[0]) {
      // Aus Sicherheitsgründen geben wir nicht an, dass die E-Mail nicht existiert
      return res.status(200).send("Reset password instructions sent if email exists");
    }
    
    // Token für Passwort-Reset generieren
    const resetToken = generateToken();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 Stunde gültig
    
    // Token in der Datenbank speichern
    await pool.request()
      .input("userId", sql.Int, user.recordset[0].Id)
      .input("resetToken", sql.NVarChar, resetToken)
      .input("resetTokenExpiry", sql.DateTime, resetTokenExpiry)
      .query("UPDATE WebUsers SET ResetPasswordToken = @resetToken, ResetPasswordTokenExpiry = @resetTokenExpiry WHERE Id = @userId");
    
    // E-Mail senden
    await sendPasswordResetEmail(email, resetToken);
    
    res.status(200).send("Reset password instructions sent");
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).send("Error processing password reset request");
  }
}

/**
 * Überprüft, ob ein Passwort-Reset-Token gültig ist
 */
async function verifyResetToken(req, res) {
  const { token } = req.params;
  if (!token) return res.status(400).send("Token is required");
  
  try {
    await poolConnect;
    
    // Token in der Datenbank suchen
    const user = await pool.request()
      .input("token", sql.NVarChar, token)
      .input("now", sql.DateTime, new Date())
      .query("SELECT * FROM WebUsers WHERE ResetPasswordToken = @token AND ResetPasswordTokenExpiry > @now");
    
    if (!user.recordset[0]) {
      return res.status(400).send("Invalid or expired token");
    }
    
    res.status(200).send("Token is valid");
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(500).send("Error verifying token");
  }
}

/**
 * Setzt das Passwort zurück
 */
async function resetPassword(req, res) {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).send("Token and password are required");
  
  try {
    await poolConnect;
    
    // Token in der Datenbank suchen
    const user = await pool.request()
      .input("token", sql.NVarChar, token)
      .input("now", sql.DateTime, new Date())
      .query("SELECT * FROM WebUsers WHERE ResetPasswordToken = @token AND ResetPasswordTokenExpiry > @now");
    
    if (!user.recordset[0]) {
      return res.status(400).send("Invalid or expired token");
    }
    
    // Neues Passwort hashen
    const hashedPassword = await hashPassword(password);
    
    // Passwort aktualisieren und Token zurücksetzen
    await pool.request()
      .input("userId", sql.Int, user.recordset[0].Id)
      .input("password", sql.NVarChar, hashedPassword)
      .query("UPDATE WebUsers SET PasswordHash = @password, ResetPasswordToken = NULL, ResetPasswordTokenExpiry = NULL WHERE Id = @userId");
    
    res.status(200).send("Password has been reset successfully");
  } catch (err) {
    console.error("Password reset error:", err);
    res.status(500).send("Error resetting password");
  }
}

/**
 * Bestätigt die E-Mail-Adresse eines Benutzers
 */
async function verifyEmail(req, res) {
  const { token } = req.params;
  if (!token) return res.status(400).send("Token is required");
  
  try {
    await poolConnect;
    
    // Token in der Datenbank suchen
    const user = await pool.request()
      .input("token", sql.NVarChar, token)
      .input("now", sql.DateTime, new Date())
      .query("SELECT * FROM WebUsers WHERE VerificationToken = @token AND VerificationTokenExpiry > @now");
    
    if (!user.recordset[0]) {
      return res.status(400).send("Invalid or expired token");
    }
    
    // E-Mail als verifiziert markieren und Token zurücksetzen
    await pool.request()
      .input("userId", sql.Int, user.recordset[0].Id)
      .query("UPDATE WebUsers SET EmailVerified = 1, VerificationToken = NULL, VerificationTokenExpiry = NULL WHERE Id = @userId");
    
    res.status(200).send("Email has been verified successfully");
  } catch (err) {
    console.error("Email verification error:", err);
    res.status(500).send("Error verifying email");
  }
}

/**
 * Sendet eine neue Verifizierungs-E-Mail
 */
async function resendVerificationEmail(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).send("Email is required");
  
  try {
    await poolConnect;
    
    // Benutzer in der Datenbank suchen
    const user = await pool.request()
      .input("email", sql.NVarChar, email)
      .query("SELECT * FROM WebUsers WHERE Email = @email");
    
    if (!user.recordset[0]) {
      // Aus Sicherheitsgründen geben wir nicht an, dass die E-Mail nicht existiert
      return res.status(200).send("Verification email sent if account exists");
    }
    
    // Wenn die E-Mail bereits verifiziert ist
    if (user.recordset[0].EmailVerified) {
      return res.status(400).send("Email is already verified");
    }
    
    // Neuen Token generieren
    const verificationToken = generateToken();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Stunden gültig
    
    // Token in der Datenbank aktualisieren
    await pool.request()
      .input("userId", sql.Int, user.recordset[0].Id)
      .input("verificationToken", sql.NVarChar, verificationToken)
      .input("verificationExpiry", sql.DateTime, verificationExpiry)
      .query("UPDATE WebUsers SET VerificationToken = @verificationToken, VerificationTokenExpiry = @verificationExpiry WHERE Id = @userId");
    
    // E-Mail senden
    await sendVerificationEmail(email, verificationToken);
    
    res.status(200).send("Verification email sent");
  } catch (err) {
    console.error("Resend verification email error:", err);
    res.status(500).send("Error sending verification email");
  }
}
