const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getPendingOrganizers,
  getPendingEvents,
  getAllBookings,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, authorize('admin'), getDashboardStats);
router.get('/pending-organizers', protect, authorize('admin'), getPendingOrganizers);
router.get('/pending-events', protect, authorize('admin'), getPendingEvents);
router.get('/bookings', protect, authorize('admin'), getAllBookings);

module.exports = router;