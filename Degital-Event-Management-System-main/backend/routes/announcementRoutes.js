const express = require('express');
const {
  createAnnouncement,
  getEventAnnouncements,
  getMyAnnouncements,
  getAdminAnnouncements
} = require('../controllers/announcementController');
const { protectUser, protectAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route
router.get('/event/:eventId', getEventAnnouncements);

// User routes
router.get('/my-announcements', protectUser, getMyAnnouncements);

// Admin routes
router.post('/', protectAdmin, createAnnouncement);
router.get('/admin/my-announcements', protectAdmin, getAdminAnnouncements);

module.exports = router;

