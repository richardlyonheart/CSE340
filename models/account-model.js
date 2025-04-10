const pool = require("../database/");

/* *****************************
 * Register New Account
 ***************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  const sql = `
    INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type)
    VALUES ($1, $2, $3, $4, 'client') RETURNING *;
  `;
  const params = [account_firstname, account_lastname, account_email, account_password];

  try {
    const result = await pool.query(sql, params);
    return result.rows[0]; // Return the created account
  } catch (error) {
    console.error("Error in registerAccount:", error.message);
    throw new Error("Could not register account");
  }
}

/* **********************
 * Check for Existing Email
 ********************** */
async function checkExistingEmail(account_email) {
  const sql = `SELECT * FROM account WHERE account_email = $1`;
  try {
    const email = await pool.query(sql, [account_email]);
    return email.rowCount > 0; // Return true if email exists
  } catch (error) {
    console.error("Error in checkExistingEmail:", error.message);
    throw new Error("Could not check for email existence");
  }
}

/* *****************************
 * Return Account Data Using Email
 ***************************** */
async function getAccountByEmail(account_email) {
  const sql = `
    SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password
    FROM account WHERE account_email = $1
  `;
  try {
    const result = await pool.query(sql, [account_email]);
    if (result.rowCount === 0) throw new Error("No matching email found");
    return result.rows[0];
  } catch (error) {
    console.error("Error in getAccountByEmail:", error.message);
    throw new Error("Could not retrieve account data");
  }
}

/* *****************************
 * Update Account Information
 ***************************** */
async function updateAccountById(account_id, account_firstname, account_lastname, account_email) {
  const sql = `
    UPDATE account
    SET account_firstname = $1, account_lastname = $2, account_email = $3
    WHERE account_id = $4 RETURNING *;
  `;
  const params = [account_firstname, account_lastname, account_email, account_id];

  try {
    const result = await pool.query(sql, params);
    if (result.rowCount === 0) throw new Error("Account update failed");
    return result.rows[0]; // Return updated account
  } catch (error) {
    console.error("Error in updateAccountById:", error.message);
    throw new Error("Could not update account");
  }
}

/* *****************************
 * Update Account Password
 ***************************** */
async function updatePassword(account_id, hashedPassword) {
  const sql = `
    UPDATE account
    SET account_password = $1
    WHERE account_id = $2 RETURNING *;
  `;
  const params = [hashedPassword, parseInt(account_id, 10)];

  try {
    const result = await pool.query(sql, params);
    if (result.rowCount === 0) throw new Error("Password update failed");
    return result.rows[0]; // Return updated account
  } catch (error) {
    console.error("Error in updatePassword:", error.message);
    throw new Error("Could not update password");
  }
}

module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  updateAccountById,
  updatePassword,
};