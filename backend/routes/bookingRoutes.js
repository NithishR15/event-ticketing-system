const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  getEventBookings,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('student'), createBooking);
router.get('/', protect, getMyBookings);
router.get('/event/:eventId', protect, authorize('organizer', 'admin'), getEventBookings);
router.get('/:id', protect, getBookingById);
router.delete('/:id', protect, authorize('student'), cancelBooking);

module.exports = router;