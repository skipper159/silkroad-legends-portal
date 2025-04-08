
const { pool, poolConnect, sql } = require("../db");

/**
 * Get user profile
 */
async function getUserProfile(req, res) {
  await poolConnect;
  try {
    const result = await pool.request()
      .input("id", sql.Int, req.user.id)
      .query(`
        SELECT 
          Id, Username, Email, RegisteredAt, LastLogin, 
          (SELECT SilkAmount FROM UserWallets WHERE UserId = WebUsers.Id) AS SilkBalance
        FROM WebUsers 
        WHERE Id = @id
      `);

    if (!result.recordset[0]) return res.status(404).send("User not found");
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching user profile");
  }
}

/**
 * Get all users (admin only)
 */
async function getAllUsers(req, res) {
  await poolConnect;
  try {
    const result = await pool.request()
      .query(`
        SELECT 
          Id, Username, Email, RegisteredAt, LastLogin, RoleId,
          (SELECT Name FROM Roles WHERE Id = WebUsers.RoleId) AS RoleName
        FROM WebUsers
        ORDER BY RegisteredAt DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching user list");
  }
}

/**
 * Update user information (own account)
 */
async function updateUser(req, res) {
  const { email, currentPassword, newPassword } = req.body;
  const userId = req.user.id;
  
  await poolConnect;
  const transaction = new sql.Transaction(pool);
  
  try {
    await transaction.begin();
    
    if (email) {
      await pool.request()
        .input("userId", sql.Int, userId)
        .input("email", sql.NVarChar, email)
        .query(`UPDATE WebUsers SET Email = @email WHERE Id = @userId`);
    }
    
    if (currentPassword && newPassword) {
      const { hashPassword, comparePassword } = require("../utils/hash");
      
      // Verify current password
      const user = await pool.request()
        .input("userId", sql.Int, userId)
        .query(`SELECT PasswordHash FROM WebUsers WHERE Id = @userId`);
        
      const valid = await comparePassword(currentPassword, user.recordset[0].PasswordHash);
      if (!valid) {
        await transaction.rollback();
        return res.status(403).send("Current password is incorrect");
      }
      
      // Update password
      const hashedNewPassword = await hashPassword(newPassword);
      await pool.request()
        .input("userId", sql.Int, userId)
        .input("password", sql.NVarChar, hashedNewPassword)
        .query(`UPDATE WebUsers SET PasswordHash = @password WHERE Id = @userId`);
    }
    
    await transaction.commit();
    res.send("User information updated");
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    res.status(500).send("Error updating user information");
  }
}

module.exports = {
  getUserProfile,
  getAllUsers,
  updateUser
};
