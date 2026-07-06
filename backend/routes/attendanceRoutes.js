const express = require('express');
const router = express.Router();
const {
  getEventAttendance,
  exportAttendanceCSV,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/:eventId', protect, authorize('organizer', 'admin'), getEventAttendance);
router.get('/:eventId/export', protect, authorize('organizer', 'admin'), exportAttendanceCSV);

module.exports = router;