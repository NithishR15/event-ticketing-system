const express = require('express');
const router = express.Router();
const { scanTicket } = require('../controllers/scanController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('organizer', 'admin'), scanTicket);

module.exports = router;