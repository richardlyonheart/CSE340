// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const invManagementController = require("../controllers/invManagementController");
const utilities = require("../utilities");
const { newInventoryRules, checkUpdateData } = require("../utilities/inventory-validation");
const { restrictToRoles } = require("../utilities/account-validation");
const { body } = require("express-validator");
const ReviewController = require('../controllers/reviewController');
const { ensureLoggedIn } = require('../utilities/auth-middleware');

// console.log('ReviewController:', require('../controllers/reviewController'));
// console.log('ReviewController.handleAddReview:', require('../controllers/reviewController').handleAddReview);
// console.log('ensureLoggedIn:', require('../utilities/auth-middleware').ensureLoggedIn);
// console.log('utilities.handleErrors:', require('../utilities').handleErrors);

// ==========================
// Public Routes
// ==========================

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to get inventory as JSON
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Route to build vehicle page by vehicleId
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId));

router.post(
  '/reviews/add',
  ensureLoggedIn,
  [
    body('review_text').notEmpty().withMessage('Review text is required.'),
    body('inv_id').isInt().withMessage('Invalid inventory ID.'),
    body('account_id').isInt().withMessage('Invalid account ID.')
  ],
  utilities.handleErrors(ReviewController.handleAddReview)
);

// ==========================
// Restricted Routes - employee/admin
// ==========================

// Route for inventory management page
router.get("/", restrictToRoles(["Employee", "Admin"]), utilities.handleErrors(invManagementController.buildInvManagement));

// Routes for deleting inventory items
router.get("/delete/:inv_id", restrictToRoles(["Employee", "Admin"]), utilities.handleErrors(invManagementController.buildDeleteView));
router.post("/delete", restrictToRoles(["Employee", "Admin"]), utilities.handleErrors(invManagementController.processDelete));

// Route for editing inventory items in management view
router.get("/edit/:inv_id", restrictToRoles(["Employee", "Admin"]), utilities.handleErrors(invManagementController.editInventoryView));

// Route for updating inventory
router.post(
  "/update",
  restrictToRoles(["Employee", "Admin"]),
  newInventoryRules(),
  checkUpdateData,
  utilities.handleErrors(invManagementController.updateInventoryResult)
);

// Route for adding classification
router.get(
  "/add-classification",
  restrictToRoles(["Employee", "Admin"]),
  utilities.handleErrors(invManagementController.buildAddClassification)
);
router.post(
  "/add-classification",
  restrictToRoles(["Employee", "Admin"]),
  utilities.handleErrors(invManagementController.addClassResult)
);

// Routes for adding inventory
router.get("/add-inventory", restrictToRoles(["Employee", "Admin"]), utilities.handleErrors(invManagementController.buildAddInventory));
router.post(
  "/add-inventory",
  restrictToRoles(["Employee", "Admin"]),
  [
    body("classification_id").notEmpty().withMessage("Classification is required."),
    body("inv_make").isLength({ min: 3 }).withMessage("Make must be at least 3 characters long."),
    body("inv_model").isLength({ min: 3 }).withMessage("Model must be at least 3 characters long."),
    body("inv_year").matches(/^\d{4}$/).withMessage("Year must be a 4-digit number."),
    body("inv_price").isFloat({ gt: 0 }).withMessage("Price must be a positive number."),
    body("inv_miles").isInt({ min: 0 }).withMessage("Mileage must be a valid number."),
    body("inv_color").notEmpty().withMessage("Color is required."),
    body("inv_thumbnail").isURL().withMessage("Thumbnail must be a valid URL."),
    body("inv_image").isURL().withMessage("Image must be a valid URL."),
  ],
  utilities.handleErrors(invManagementController.addInventoryResult)
);

module.exports = router;