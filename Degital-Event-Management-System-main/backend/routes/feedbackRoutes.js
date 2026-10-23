const express = require('express');
const {
  submitFeedback,
  getEventFeedback,
  getMyFeedback
} = require('../controllers/feedbackController');
const { protectUser } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route
router.get('/event/:eventId', getEventFeedback);

// User routes
router.post('/', protectUser, submitFeedback);
router.get('/my-feedback', protectUser, getMyFeedback);

module.exports = router;

