const invModel = require("../models/inventory-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************ */
Util.getNav = async function () {
  try {
    const data = await invModel.getClassifications();

    const list = `
      <ul>
        <li><a href="/" title="Home page">Home</a></li>
        ${data.rows
          .map(
            (row) => `
            <li>
              <a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">
                ${row.classification_name}
              </a>
            </li>
          `
          )
          .join('')}
      </ul>
    `;
    return list;
  } catch (error) {
    console.error("Error building navigation:", error.message);
    throw new Error("Could not retrieve classifications.");
  }
};

/* **************************************
 * Build the classification view HTML
 ************************************** */
Util.buildClassificationGrid = async function (data) {
  if (data.length > 0) {
    const gridItems = data
      .map(
        (vehicle) => `
      <li>
        <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
          <img src="${vehicle.inv_thumbnail}" alt="${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors">
        </a>
        <div class="namePrice">
          <hr />
          <h2>
            <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
              ${vehicle.inv_make} ${vehicle.inv_model}
            </a>
          </h2>
          <span>$${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</span>
        </div>
      </li>
    `
      )
      .join('');

    return `<ul id="inv-display">${gridItems}</ul>`;
  } else {
    return '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
};

/* **************************************
 * Build HTML for vehicle pages
 ************************************** */
Util.buildVehiclePage = async function (data) {
  if (data) {
    return `
      <section id="vehicle-details">
        <div class="vehicle-container">
          <div class="vehicle-image-container">
            <img src="${data.inv_image}" alt="${data.inv_make} ${data.inv_model}">
          </div>
          <div class="vehicle-details-container">
            <h2>${data.inv_make} ${data.inv_model}</h2>
            <p>
              <strong>Year:</strong> ${data.inv_year}<br>
              <strong>Color:</strong> ${data.inv_color}<br>
              <strong>Miles:</strong> ${new Intl.NumberFormat("en-US").format(data.inv_miles)} miles<br>
            </p>
            <p>${data.inv_description}</p>
            <p class="price">Price: $${new Intl.NumberFormat("en-US").format(data.inv_price)}</p>
          </div>
        </div>
      </section>
    `;
  } else {
    return '<p class="notice">Sorry, the vehicle you are looking for could not be found.</p>';
  }
};

/* ****************************************
 * Middleware For Handling Errors
 **************************************** */
Util.handleErrors = (fn) => {
  if (typeof fn !== "function") {
    throw new Error(`handleErrors expected a function but got: ${typeof fn}`);
  }
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
};

/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  console.log("✅ JWT Middleware Triggered");

  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, accountData) => {
      if (err) {
        console.error("❌ JWT verification error:", err.message);
        req.flash("notice", "Please log in.");
        res.clearCookie("jwt");
        return res.redirect("/account/login");
      }

      console.log("✅ JWT Verified Successfully:", accountData);
      res.locals.accountData = accountData;
      res.locals.loggedIn = true;
      next();
    });
  } else {
    console.log("⚠️ No JWT token found");
    next();
  }
};
/* ****************************************
 * Middleware to check login
 **************************************** */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedIn) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    res.redirect("/account/login");
  }
};

module.exports = Util;