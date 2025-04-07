function ensureLoggedIn(req, res, next) {
    if (req.session.accountId) {
      // console.log('User is logged in:', req.session.accountId);
      next();
    } else {
      // console.log('User is not logged in');
      req.flash('error', 'You must log in to perform this action.');
      res.redirect('/login');
    }
  }
  
  module.exports = { ensureLoggedIn };
  