const express = require('express');
const router = express.Router();
const {
  createReview,
  getEventReviews,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('student'), createReview);
router.get('/event/:eventId', getEventReviews);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;