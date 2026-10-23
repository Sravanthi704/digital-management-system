const Feedback = require('../models/feedbackModel');
const Event = require('../models/eventModel');
const Registration = require('../models/registrationModel');

/**
 * @desc    Submit feedback for an event
 * @route   POST /api/feedback
 * @access  Private
 */
const submitFeedback = async (req, res) => {
  try {
    const { eventId, rating, comment } = req.body;

    // Validation
    if (!eventId || !rating) {
      return res.status(400).json({ message: 'Please provide event ID and rating' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is registered for this event
    const registration = await Registration.findOne({
      user: req.user._id,
      event: eventId
    });

    if (!registration) {
      return res.status(400).json({ message: 'You must be registered to submit feedback' });
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({
      user: req.user._id,
      event: eventId
    });

    if (existingFeedback) {
      return res.status(400).json({ message: 'Feedback already submitted for this event' });
    }

    // Create feedback
    const feedback = await Feedback.create({
      event: eventId,
      user: req.user._id,
      rating,
      comment: comment || ''
    });

    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate('user', 'name email')
      .populate('event', 'title');

    res.status(201).json(populatedFeedback);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Feedback already submitted for this event' });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get feedback for an event
 * @route   GET /api/feedback/event/:eventId
 * @access  Public
 */
const getEventFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ event: req.params.eventId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const avgRating = feedbacks.length > 0
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
      : 0;

    res.json({
      feedbacks,
      avgRating: avgRating.toFixed(2),
      totalFeedback: feedbacks.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get user's feedback
 * @route   GET /api/feedback/my-feedback
 * @access  Private
 */
const getMyFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ user: req.user._id })
      .populate('event', 'title date location')
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitFeedback,
  getEventFeedback,
  getMyFeedback
};

