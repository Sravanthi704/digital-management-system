const express = require('express');
const {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  getAdminAnalytics
} = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/profile', protectAdmin, getAdminProfile);
router.get('/analytics', protectAdmin, getAdminAnalytics);

module.exports = router;

