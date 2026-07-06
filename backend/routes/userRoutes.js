const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  setUserStatus,
  approveOrganizer,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin'), getUsers);
router.get('/:id', protect, authorize('admin'), getUserById);
router.put('/:id/status', protect, authorize('admin'), setUserStatus);
router.put('/:id/approve-organizer', protect, authorize('admin'), approveOrganizer);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;