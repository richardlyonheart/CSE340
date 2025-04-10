// Required Resources
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const {
    registationRules,
    checkRegData,
    loginRules,
    checkLoginData
} = require("../utilities/account-validation");

// Debugging Logs for Utilities and Controllers
console.log("Type of handleErrors:", typeof utilities.handleErrors);
console.log("Type of checkJWTToken:", typeof utilities.checkJWTToken);
console.log("Type of checkLogin:", typeof utilities.checkLogin);
console.log("Type of buildManagement:", typeof accountController.buildManagement);

// Route for Account Management
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement));

// Route for displaying the login page
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route for displaying the registration page
router.get("/register", utilities.handleErrors(accountController.buildRegistration));

// Route for accessing 'My Account' page
router.get("/account", utilities.checkJWTToken, accountController.buildAccount);

// Route for handling the registration form submission
router.post(
    "/register",
    registationRules(), // Ensure validation rules are applied
    checkRegData,       // Middleware to check form data
    utilities.handleErrors(accountController.registerAccount)
);

// Route for processing the login request
router.post(
    "/login",
    loginRules(),      // Ensure login validation rules are applied
    checkLoginData,    // Middleware to check login data
    utilities.handleErrors(async (req, res) => {
        // Example login logic
        const user = {
            first_name: "Brenden", // Sample user data
            account_type: "employee",
            isLoggedIn: true
        };
        req.user = user; // Attach user info to request
        res.render("account/management", { user,
          title: "Account Management"
         });
    })
);

// Route for displaying the update account view
router.get("/update", utilities.handleErrors(accountController.buildUpdateView));

// Route for updating account information
router.post("/update", utilities.handleErrors(accountController.updateAccount));

// Route for changing account password
router.post("/change-password", utilities.handleErrors(accountController.changePassword));

// Route for logging out
router.get("/logout", (req, res) => {
    res.clearCookie("jwt"); // Clear JWT or session cookie
    req.user = null; // Clear user data
    res.redirect("/account/login"); // Redirect to login page
});

// Export the router
module.exports = router;