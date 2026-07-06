const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
  setEventApproval,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getEvents);
router.get('/organizer/mine', protect, authorize('organizer'), getMyEvents);
router.get('/:id', getEventById);
router.post('/', protect, authorize('organizer'), upload.single('banner'), createEvent);
router.put('/:id', protect, authorize('organizer', 'admin'), upload.single('banner'), updateEvent);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteEvent);
router.put('/:id/approval', protect, authorize('admin'), setEventApproval);

module.exports = router;