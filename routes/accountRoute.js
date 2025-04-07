const express = require("express")
 const router = new express.Router()
 const accountController = require("../controllers/accountController")
 const utilities = require("../utilities/")
 const regValidate = require('../utilities/account-validation')
 
 // Route for when 'My Account' is clicked
 router.get("/login", utilities.handleErrors(accountController.buildLogin));
 
 // Route for register button
 router.get("/register", utilities.handleErrors(accountController.buildRegistration));
 
 // Route for submitting register form
 router.post('/register',
     regValidate.registationRules(),
     regValidate.checkRegData,
     utilities.handleErrors(accountController.registerAccount)
 )
 
 router.post(
    "/login",
    (req,res) => {
        res.status(200).senc('login process')
    }
 )
 
 module.exports = router;