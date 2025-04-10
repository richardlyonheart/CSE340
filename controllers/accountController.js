// Required Modules
const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { validationResult } = require("express-validator");

/* ****************************************
 * Deliver login view
 **************************************** */
async function buildLogin(req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null,
    });
  } catch (error) {
    console.error("Error in buildLogin:", error.message);
    next(error);
  }
}

/* ****************************************
 * Deliver registration view
 **************************************** */
async function buildRegistration(req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    });
  } catch (error) {
    console.error("Error in buildRegistration:", error.message);
    next(error);
  }
}

/* ****************************************
 * Process Registration
 **************************************** */
async function registerAccount(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const { account_firstname, account_lastname, account_email, account_password } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(account_password, 10);

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    if (regResult) {
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
      return res.redirect("/account/login");
    } else {
      req.flash("notice", "Sorry, the registration failed.");
      return res.status(500).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
      });
    }
  } catch (error) {
    console.error("Error in registerAccount:", error.message);
    req.flash("notice", "Sorry, there was an error processing the registration.");
    return res.status(500).render("account/register", {
      title: "Registration",
      nav: await utilities.getNav(),
      errors: null,
    });
  }
}

/* ****************************************
 * Process login request
 **************************************** */
async function accountLogin(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const { account_email, account_password } = req.body;

    const accountData = await accountModel.getAccountByEmail(account_email);
    if (!accountData) {
      req.flash("notice", "Invalid email or password.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }

    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password);
    if (passwordMatch) {
      delete accountData.account_password;
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

      res.cookie("jwt", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: 3600 * 1000,
      });

      return res.redirect("/account");
    } else {
      req.flash("notice", "Invalid email or password.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    console.error("Error in accountLogin:", error.message);
    next(error);
  }
}

/* ****************************************
 * Deliver account view
 **************************************** */
async function buildAccount(req, res) {
  console.log("✅ buildAccount Executed");
  console.log("User Data in Account Page:", res.locals.accountData);

  const nav = await utilities.getNav();
  res.render("account/account", {
    title: "Account Management",
    nav,
    firstName: res.locals.accountData?.account_firstname || "User",
    accountType: res.locals.accountData?.account_type || "Client",
    errors: null,
  });
}

module.exports = { buildAccount };

/* ****************************************
 * Deliver update account view
 **************************************** */
async function buildUpdateView(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const accountEmail = res.locals.accountData?.account_email;

    if (!accountEmail) {
      req.flash("notice", "Account email not found. Please log in.");
      return res.redirect("/account/login");
    }

    const account = await accountModel.getAccountByEmail(accountEmail);

    if (!account) {
      req.flash("notice", "Account not found.");
      return res.redirect("/account/login");
    }

    res.render("account/update", {
      title: "Update Account",
      nav,
      locals: account,
      errors: null,
    });
  } catch (error) {
    console.error("Error in buildUpdateView:", error.message);
    next(error);
  }
}

/* ****************************************
 * Update account info
 **************************************** */
async function updateAccount(req, res, next) {
  try {
    const errors = validationResult(req);
    const nav = await utilities.getNav();

    if (!errors.isEmpty()) {
      return res.status(400).render("account/update", {
        title: "Update Account",
        errors: errors.array(),
        locals: req.body,
        nav,
      });
    }

    const { account_id, account_firstname, account_lastname, account_email } = req.body;

    const updateResult = await accountModel.updateAccountById(
      parseInt(account_id),
      account_firstname,
      account_lastname,
      account_email
    );

    if (updateResult) {
      req.flash("notice", "Account updated successfully.");
      res.redirect("/account");
    } else {
      req.flash("notice", "Account update failed. Please try again.");
      res.status(500).redirect("/account/update");
    }
  } catch (error) {
    console.error("Error updating account:", error.message);
    req.flash("notice", "An error occurred while updating the account. Please try again.");
    res.status(500).redirect("/account/update");
  }
}

/* ****************************************
 * Change password logic
 **************************************** */
async function changePassword(req, res, next) {
  try {
    const { new_password, account_id } = req.body;
    const hashedPassword = await bcrypt.hash(new_password, 10);

    await accountModel.updatePassword(account_id, hashedPassword);
    res.redirect("/account");
  } catch (error) {
    console.error("Error in changePassword:", error.message);
    next(error);
  }
}

/* ****************************************
 * Deliver account management view
 **************************************** */
async function buildManagement(req, res) {
  console.log("✅ buildManagement Executed");

  const nav = await utilities.getNav();
  res.render("account/management", {
    title: "Account Management",
    nav,
  });
}

module.exports = {
  buildManagement,
  buildLogin,
  buildRegistration,
  registerAccount,
  accountLogin,
  buildAccount,
  buildUpdateView,
  updateAccount,
  changePassword,
};