const Announcement = require('../models/announcementModel');
const Event = require('../models/eventModel');
const Registration = require('../models/registrationModel');

/**
 * @desc    Create announcement for an event
 * @route   POST /api/announcements
 * @access  Private/Admin
 */
const createAnnouncement = async (req, res) => {
  try {
    const { eventId, title, message } = req.body;

    // Validation
    if (!eventId || !title || !message) {
      return res.status(400).json({ message: 'Please provide event ID, title, and message' });
    }

    // Check if event exists and belongs to admin
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.createdBy.toString() !== req.admin._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to create announcement for this event' });
    }

    // Create announcement
    const announcement = await Announcement.create({
      event: eventId,
      admin: req.admin._id,
      title,
      message
    });

    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate('event', 'title')
      .populate('admin', 'name orgName');

    // Get all registered users (paid only) for EmailJS
    const registrations = await Registration.find({
      event: eventId,
      paymentStatus: 'paid'
    }).populate('user', 'email name');

    const userEmails = registrations.map(reg => ({
      email: reg.user.email,
      name: reg.user.name
    }));

    res.status(201).json({
      announcement: populatedAnnouncement,
      userEmails // Send to frontend for EmailJS
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get announcements for an event
 * @route   GET /api/announcements/event/:eventId
 * @access  Public
 */
const getEventAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ event: req.params.eventId })
      .populate('admin', 'name orgName')
      .populate('event', 'title')
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get user's announcements (for events they're registered for)
 * @route   GET /api/announcements/my-announcements
 * @access  Private
 */
const getMyAnnouncements = async (req, res) => {
  try {
    // Get all events user is registered for (paid only)
    const registrations = await Registration.find({
      user: req.user._id,
      paymentStatus: 'paid'
    });

    const eventIds = registrations.map(reg => reg.event);

    // Get announcements for those events
    const announcements = await Announcement.find({ event: { $in: eventIds } })
      .populate('admin', 'name orgName')
      .populate('event', 'title date location')
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all announcements for admin's events
 * @route   GET /api/announcements/admin/my-announcements
 * @access  Private/Admin
 */
const getAdminAnnouncements = async (req, res) => {
  try {
    // Get all events created by this admin
    const events = await Event.find({ createdBy: req.admin._id });
    const eventIds = events.map(event => event._id);

    // Get announcements for those events
    const announcements = await Announcement.find({ event: { $in: eventIds } })
      .populate('admin', 'name orgName')
      .populate('event', 'title date location')
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAnnouncement,
  getEventAnnouncements,
  getMyAnnouncements,
  getAdminAnnouncements
};

