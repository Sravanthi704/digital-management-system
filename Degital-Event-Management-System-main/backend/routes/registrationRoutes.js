const express = require('express');
const {
  registerForEvent,
  confirmPayment,
  getMyRegistrations,
  getEventRegistrations,
  exportEventRegistrations,
  cancelRegistration
} = require('../controllers/registrationController');
const { protectUser, protectAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// User routes
router.post('/', protectUser, registerForEvent);
router.get('/my-registrations', protectUser, getMyRegistrations);
router.put('/:id/confirm-payment', protectUser, confirmPayment);
router.delete('/:id', protectUser, cancelRegistration);

// Admin routes
router.get('/event/:eventId', protectAdmin, getEventRegistrations);
router.get('/event/:eventId/export', protectAdmin, exportEventRegistrations);

module.exports = router;
