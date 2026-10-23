const Admin = require('../models/adminModel');
const generateToken = require('../utils/generateToken');

/**
 * @desc    Register a new admin
 * @route   POST /api/admin/register
 * @access  Public
 */
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, orgName, location } = req.body;

    // Validation
    if (!name || !email || !password || !orgName || !location) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    // Check if admin exists
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      password,
      orgName,
      location
    });

    if (admin) {
      res.status(201).json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        orgName: admin.orgName,
        location: admin.location,
        profileImage: admin.profileImage,
        token: generateToken(admin._id, 'admin')
      });
    } else {
      res.status(400).json({ message: 'Invalid admin data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Login admin
 * @route   POST /api/admin/login
 * @access  Public
 */
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for admin
    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
      res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        orgName: admin.orgName,
        location: admin.location,
        profileImage: admin.profileImage,
        token: generateToken(admin._id, 'admin')
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get admin profile
 * @route   GET /api/admin/profile
 * @access  Private
 */
const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-password');
    
    if (admin) {
      res.json(admin);
    } else {
      res.status(404).json({ message: 'Admin not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get admin dashboard analytics
 * @route   GET /api/admin/analytics
 * @access  Private
 */
const getAdminAnalytics = async (req, res) => {
  try {
    const Event = require('../models/eventModel');
    const Registration = require('../models/registrationModel');
    const Feedback = require('../models/feedbackModel');

    // Total events created by this admin
    const totalEvents = await Event.countDocuments({ createdBy: req.admin._id });

    // Total participants across all admin events
    const totalParticipants = await Registration.countDocuments({
      event: { $in: await Event.find({ createdBy: req.admin._id }).distinct('_id') }
    });

    // Paid vs free events
    const paidEvents = await Event.countDocuments({
      createdBy: req.admin._id,
      isPaid: true
    });
    const freeEvents = await Event.countDocuments({
      createdBy: req.admin._id,
      isPaid: false
    });

    // Top events by participants
    const events = await Event.find({ createdBy: req.admin._id });
    const topEvents = await Promise.all(
      events.map(async (event) => {
        const participants = await Registration.countDocuments({ event: event._id });
        const feedbacks = await Feedback.find({ event: event._id });
        const avgRating = feedbacks.length > 0
          ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
          : 0;

        return {
          eventId: event._id,
          title: event.title,
          participants,
          avgRating: avgRating.toFixed(2)
        };
      })
    );

    // Sort by participants
    topEvents.sort((a, b) => b.participants - a.participants);

    res.json({
      totalEvents,
      totalParticipants,
      paidEvents,
      freeEvents,
      topEvents: topEvents.slice(0, 5) // Top 5 events
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  getAdminAnalytics
};

