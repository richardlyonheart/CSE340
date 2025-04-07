const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const invManagementController = require("../controllers/invManagementController");
const utilities = require("../utilities");

router.get("/type/:classificationId", invController.buildByClassificationId);

router.get("/detail/:invId", invController.buildByInvId);

// Route for inventory management page
router.get("/", utilities.handleErrors(invManagementController.buildInvManagement));
 
// Route for adding classification
router.get("/add-classification", (req, res, next) => {
    console.log("Route reached: /inv/add-classification");
    next();
  }, utilities.handleErrors(invManagementController.buildAddClassification));

// Route to process adding a classification
router.post("/add-classification", invManagementController.addClassResult);

// Routes for adding inventory
router.get("/add-inventory", utilities.handleErrors(invManagementController.buildAddInventory));

const { body } = require("express-validator");

router.post(
  "/add-inventory",
  [
    body("classification_id").notEmpty().withMessage("Classification is required."),
    body("inv_make")
      .isLength({ min: 3 })
      .withMessage("Make must be at least 3 characters long."),
    body("inv_model")
      .isLength({ min: 3 })
      .withMessage("Model must be at least 3 characters long."),
    body("inv_year")
      .matches(/^\d{4}$/)
      .withMessage("Year must be a 4-digit number."),
    body("inv_price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be a positive number."),
    body("inv_miles")
      .isInt({ min: 0 })
      .withMessage("Mileage must be a valid number."),
    body("inv_color").notEmpty().withMessage("Color is required."),
    body("inv_thumbnail").isURL().withMessage("Thumbnail must be a valid URL."),
    body("inv_image").isURL().withMessage("Image must be a valid URL."),
  ],
  invManagementController.addInventoryResult
);

module.exports = router;