const pool = require("../database/")

class ReviewModel {
    static async createReview(reviewText, invId, accountId) {
      const query = `
        INSERT INTO review (review_text, review_date, inv_id, account_id)
        VALUES ($1, NOW(), $2, $3)
        RETURNING *;
      `;
      const values = [reviewText, invId, accountId];
      const result = await pool.query(query, values);
      return result.rows[0];
    }
  
    static async getReviewsByInvId(invId) {
      const query = `
        SELECT r.review_text, r.review_date, 
               CONCAT(SUBSTRING(a.account_firstname, 1, 1), a.account_lastname) AS screen_name
        FROM review r
        JOIN account a ON r.account_id = a.account_id
        WHERE r.inv_id = $1
        ORDER BY r.review_date DESC;
      `;
      const result = await pool.query(query, [invId]);
      return result.rows;
    }
  }
  
  module.exports = ReviewModel;