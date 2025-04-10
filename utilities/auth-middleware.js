function ensureLoggedIn(req, res, next) {
  if (req.session.accountId) {
    // Log successful session detection (optional for debugging)
    console.log("User is logged in:", req.session.accountId);
    next();
  } else {
    // Log unauthorized access attempt (optional for diagnostics)
    console.error("Unauthorized access attempt detected.");
    req.flash("error", "You must log in to perform this action.");
    req.session.returnTo = req.originalUrl; // Save intended page
    res.redirect("/login");
  }
}

module.exports = { ensureLoggedIn };