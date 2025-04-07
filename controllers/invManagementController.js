const utilities = require("../utilities")
 const invModel = require("../models/inventory-model")
 
 /* ****************************************
 *  Deliver inv management view
 * *************************************** */
 async function buildInvManagement(req, res, next) {
     try {
       let nav = await utilities.getNav()
       res.render("inventory/management", {
         title: "Inventory Management",
         nav,
         errors: null,
     })
   } catch(err) {
     next(err)
   }}
 
 /* ****************************************
 *  Deliver add-classification view
 * *************************************** */
 async function buildAddClassification(req, res, next) {
   console.log("build add classification working")
   try {
     let nav = await utilities.getNav()
     res.render("inventory/add-classification", {
       title: "Inventory Management - Add Classification",
       nav,
       errors: null,
   })
 } catch(err) {
   next(err)
 }}
 
 /* ****************************************
  *  Process Add Class
  * *************************************** */
 async function addClassResult(req, res, next) {
   try {
     const classification_name = req.body.classification_name.trim();
 
     if (!classification_name || classification_name.length < 3 || !/^[a-zA-Z\s]+$/.test(classification_name)) {
       req.flash(
         "notice",
         "Classification name must be at least 3 characters long and contain only letters."
       );
       return res.status(400).render("inventory/add-classification", {
         title: "Add Classification",
         nav: await utilities.getNav(),
         errors: null,
       });
     }
 
     const result = await invModel.addClass(classification_name);
 
     if (result && result.success) {
       req.flash(
         "notice",
         `Congratulations, you've successfully added "${classification_name}".`
       );
       return res.redirect("/inv");
     } else if (result && result.message === "Classification name already exists") {
       req.flash("notice", result.message);
     } else {
       req.flash("notice", "Sorry, adding the classification failed.");
     }
 
     return res.status(500).render("inventory/add-classification", {
       title: "Add Classification",
       nav: await utilities.getNav(),
       errors: null,
     });
   } catch (err) {
     console.error("Error in addClassResult:", err);
     next(err);
   }
 }
 
 async function buildAddInventory(req, res, next) {
   try {
     const classifications = await invModel.getClassifications();
     const nav = await utilities.getNav();
 
     res.render("inventory/add-inventory", {
       title: "Add New Inventory",
       nav,
       classifications: classifications.rows,
       errors: null,
     });
   } catch (err) {
     console.error("Error in buildAddInventory:", err);
     next(err);
   }
 }
 
 const { validationResult } = require("express-validator");
 
 async function addInventoryResult(req, res, next) {
   const errors = validationResult(req);
 
   if (!errors.isEmpty()) {
     const classifications = await invModel.getClassifications();
     const nav = await utilities.getNav();
 
     return res.status(400).render("inventory/add-inventory", {
       title: "Add New Inventory",
       nav,
       classifications: classifications.rows,
       errors: errors.array(), // Pass errors to the view
       locals:req.body,
     });
   }
 
   try {
     const {
       classification_id,
       inv_make,
       inv_model,
       inv_year,
       inv_description,
       inv_thumbnail,
       inv_image,
       inv_price,
       inv_miles,
       inv_color,
     } = req.body;
 
     const result = await invModel.addInventory({
       classification_id,
       inv_make,
       inv_model,
       inv_year,
       inv_description,
       inv_thumbnail,
       inv_image,
       inv_price,
       inv_miles,
       inv_color,
     });
 
     if (result.success) {
       req.flash("notice", "Inventory added successfully!");
       return res.redirect("/inv");
     } else {
       req.flash("notice", "Failed to add inventory.");
       return res.redirect("/inv/add-inventory");
     }
   } catch (err) {
     console.error("Error in addInventoryResult:", err);
     next(err);
   }
 }
 
 
 
 
 
 module.exports = { buildInvManagement, buildAddClassification, addClassResult, buildAddInventory, addInventoryResult }