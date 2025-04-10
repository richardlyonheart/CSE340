// Required Modules
const utilities = require(".");
const accountModel = require("../models/account-model");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const validate = {};

/* **********************************
 * Registration Data Validation Rules
 *********************************** */
validate.registationRules = () => [
  // First name is required and must be a string
  body("account_firstname")
    .trim()
    .escape()
    .notEmpty()
    .isLength({ min: 1 })
    .withMessage("Please provide a first name."),

  // Last name is required and must be a string
  body("account_lastname")
    .trim()
    .escape()
    .notEmpty()
    .isLength({ min: 2 })
    .withMessage("Please provide a last name."),

  // Valid email is required and must not already exist in the database
  body("account_email")
    .trim()
    .isEmail()
    .escape()
    .normalizeEmail()
    .withMessage("A valid email is required.")
    .custom(async (account_email) => {
      const emailExists = await accountModel.checkExistingEmail(account_email);
      if (emailExists) {
        throw new Error("Email exists. Please log in or use a different email.");
      }
    }),

  // Password is required and must meet strength requirements
  body("account_password")
    .trim()
    .notEmpty()
    .isStrongPassword({
      minLength: 12,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage("Password must be at least 12 characters long and include uppercase, lowercase, numbers, and symbols."),
];

/* *******************************
 * Check Registration Data and Handle Errors
 ******************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    try {
      const nav = await utilities.getNav();
      return res.render("account/register", {
        errors: errors.array(), // Pass errors as an array
        title: "Registration",
        nav,
        account_firstname,
        account_lastname,
        account_email,
      });
    } catch (error) {
      console.error("Error fetching navigation:", error.message);
      req.flash("notice", "An unexpected error occurred.");
      return res.redirect("/account/register");
    }
  }
  next();
};

/* **********************************
 * Login Data Validation Rules
 *********************************** */
validate.loginRules = () => [
  // Valid email is required and must exist in the database
  body("account_email")
    .trim()
    .isEmail()
    .escape()
    .normalizeEmail()
    .withMessage("A valid email is required.")
    .custom(async (account_email) => {
      const emailExists = await accountModel.checkExistingEmail(account_email);
      if (!emailExists) {
        throw new Error("Email does not exist. Please register.");
      }
    }),

  // Password is required and must meet strength requirements
  body("account_password")
    .trim()
    .notEmpty()
    .isStrongPassword({
      minLength: 12,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage("Password must be at least 12 characters long and include uppercase, lowercase, numbers, and symbols."),
];

/* *******************************
 * Check Login Data and Handle Errors
 ******************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    try {
      const nav = await utilities.getNav();
      return res.render("account/login", {
        errors: errors.array(), // Pass errors as an array
        title: "Login",
        nav,
        account_email,
      });
    } catch (error) {
      console.error("Error fetching navigation:", error.message);
      req.flash("notice", "An unexpected error occurred.");
      return res.redirect("/account/login");
    }
  }
  next();
};

/* *******************************
 * Middleware to Check if Logged In
 ******************************** */
const checkLoggedIn = (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      res.locals.loggedIn = true;
      res.locals.firstName = decoded.first_name;
      res.locals.accountType = decoded.account_type;
    } catch (err) {
      console.error("JWT Verification Failed:", err.message);
      res.locals.loggedIn = false;
    }
  } else {
    res.locals.loggedIn = false;
  }
  next();
};

/* *******************************
 * Middleware to Restrict Access by Roles
 ******************************** */
const restrictToRoles = (roles) => (req, res, next) => {
  if (!res.locals.accountData) {
    req.flash("notice", "You need to log in first.");
    console.error(`Access denied: User not logged in (URL: ${req.originalUrl})`);
    return res.redirect("/account/login");
  }

  if (roles.includes(res.locals.accountData.account_type)) {
    return next();
  }

  req.flash("notice", "You are not authorized to access this page.");
  console.error(`Access denied: User does not have required role (URL: ${req.originalUrl})`);
  res.redirect("/account/login");
};

/* *******************************
 * Module Exports
 ******************************** */
module.exports = {
  registationRules: validate.registationRules,
  checkRegData: validate.checkRegData,
  loginRules: validate.loginRules,
  checkLoginData: validate.checkLoginData,
  checkLoggedIn,
  restrictToRoles,
};