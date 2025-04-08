const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const { validationResult } = require("express-validator");

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  }

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegistration(req, res, next) {
  try {let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })} catch {
    // console.error("Error in buildRegistration:", err);
    next(err);
  }
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    );
    return res.redirect("/account/login");
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;

  if (!account_email || !account_password) {
    req.flash("notice", "Email and password are required.");
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
  }

  try {
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

    const isValidPassword = await bcrypt.compare(account_password, accountData.account_password);
    if (!isValidPassword) {
      req.flash("notice", "Invalid email or password.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }

    req.session.accountId = accountData.account_id;
    req.session.accountFirstName = accountData.account_firstname;
    req.session.accountLastName = accountData.account_lastname;
    req.session.accountName = `${accountData.account_firstname.charAt(0)}${accountData.account_lastname}`;
    console.log("Session after login:", req.session);
    

    const payload = {
      account_id: accountData.account_id,
      account_email: accountData.account_email,
      account_type: accountData.account_type,
      first_name: accountData.account_firstname,
    };

    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });

    const cookieOptions = {
      httpOnly: true,
      maxAge: 3600 * 1000,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
    };

    res.cookie("jwt", token, cookieOptions);

    req.flash("notice", "Login successful. Welcome back!");
    return res.redirect("/account/account");
  } catch (error) {
    console.error("Login Error:", error);

    req.flash("notice", "An error occurred during login. Please try again.");
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
  }
}


/* ****************************************
*  Deliver account view
* *************************************** */
async function buildAccount(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/account", {
    title: "Account Management",
    nav,
    firstName: res.locals.account_firstname,
    accountType: res.locals.account_type,
    errors: null,
  });
}

async function buildUpdateView(req, res, next) {
  // console.log("res.locals.accountData:", res.locals.accountData);
  // console.log("res.locals.loggedIn:", res.locals.loggedIn);

  try {
    let nav = await utilities.getNav();
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
    // console.error("Error in buildUpdateView:", error);
    next(error);
  }
}



/* ****************************************
 *  Update account info and rebuild update account info page
 * ************************************ */
async function updateAccount(req, res, next) {
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

  try {
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
    // console.error("Error updating account:", error);
    req.flash("notice", "An error occurred while updating the account. Please try again.");
    res.status(500).redirect("/account/update");
  }
}

/* ****************************************
 *  Change password logic
 * ************************************ */
async function changePassword(req, res, next) {
  const { new_password, account_id } = req.body;
  const hashedPassword = await bcrypt.hash(new_password, 10);
  await accountModel.updatePassword(account_id, hashedPassword);
  res.redirect("/account");
}

module.exports = { buildLogin, buildRegistration, registerAccount, accountLogin, buildAccount, buildUpdateView, updateAccount, changePassword }