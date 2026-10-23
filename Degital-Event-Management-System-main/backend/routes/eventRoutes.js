const express = require('express');
const {
  createEvent,
  getEvents,
  getEventById,
  getMyEvents,
  updateEvent,
  startEvent,
  cancelEvent,
  deleteEvent
} = require('../controllers/eventController');
const { protectAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getEvents);
router.get('/:id', getEventById);

// Admin routes
router.get('/admin/my-events', protectAdmin, getMyEvents);
router.post('/', protectAdmin, createEvent);
router.put('/:id', protectAdmin, updateEvent);
router.put('/:id/start', protectAdmin, startEvent);
router.put('/:id/cancel', protectAdmin, cancelEvent);
router.delete('/:id', protectAdmin, deleteEvent);

module.exports = router;
