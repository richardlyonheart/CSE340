const ReviewModel = require('../models/review-model');
// console.log('ReviewModel:', ReviewModel);
const { validationResult } = require('express-validator');

class ReviewController {
  static async handleAddReview(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.flash('error', errors.array().map(err => err.msg).join(', '));
      return res.redirect(`/inventory/${req.body.inv_id}`);
    }

    try {
      const { review_text, inv_id, account_id } = req.body;

      await ReviewModel.createReview(review_text, inv_id, account_id);

      req.flash('success', 'Review added successfully.');
      res.redirect(`/inventory/${inv_id}`);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReviewController;