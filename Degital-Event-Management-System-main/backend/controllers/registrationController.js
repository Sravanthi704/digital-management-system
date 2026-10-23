const Registration = require('../models/registrationModel');
const Event = require('../models/eventModel');
const generateTicket = require('../utils/generateTicket');

/**
 * @desc    Register for an event
 * @route   POST /api/registrations
 * @access  Private
 */
const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ message: 'Please provide event ID' });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is cancelled
    if (event.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot register for cancelled event' });
    }

    // Check if seats are available
    if (event.bookedSeats >= event.maxSeats) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check if already registered
    const existingRegistration = await Registration.findOne({
      user: req.user._id,
      event: eventId
    });

    if (existingRegistration) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    let paymentStatus = 'unpaid';
    let ticketCode = null;

    // For free events, automatically mark as paid and generate ticket
    if (!event.isPaid) {
      paymentStatus = 'paid';
      ticketCode = generateTicket();
    }

    // Create registration
    const registration = await Registration.create({
      user: req.user._id,
      event: eventId,
      paymentStatus,
      ticketCode
    });

    // Update event booked seats
    event.bookedSeats += 1;
    await event.save();

    const populatedRegistration = await Registration.findById(registration._id)
      .populate('user', 'name email')
      .populate('event', 'title date time location isPaid price');

    res.status(201).json({
      registration: populatedRegistration,
      userEmail: populatedRegistration.user.email, // For EmailJS
      userName: populatedRegistration.user.name
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Confirm payment for paid event
 * @route   PUT /api/registrations/:id/confirm-payment
 * @access  Private
 */
const confirmPayment = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('user', 'name email')
      .populate('event', 'title');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Check if user owns this registration
    if (registration.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if already paid
    if (registration.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Payment already confirmed' });
    }

    // Generate ticket and mark as paid
    registration.paymentStatus = 'paid';
    registration.ticketCode = generateTicket();
    await registration.save();

    const updatedRegistration = await Registration.findById(registration._id)
      .populate('user', 'name email')
      .populate('event', 'title date time location');

    res.json({
      registration: updatedRegistration,
      userEmail: updatedRegistration.user.email, // For EmailJS
      userName: updatedRegistration.user.name
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get user's registrations
 * @route   GET /api/registrations/my-registrations
 * @access  Private
 */
const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user._id })
      .populate('user', 'name email')
      .populate('event', 'title date time location category isPaid price status')
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get registrations for a specific event (admin only)
 * @route   GET /api/registrations/event/:eventId
 * @access  Private/Admin
 */
const getEventRegistrations = async (req, res) => {
  try {
    const Event = require('../models/eventModel');
    
    // Verify event belongs to admin
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.createdBy.toString() !== req.admin._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view registrations for this event' });
    }

    const registrations = await Registration.find({ event: req.params.eventId })
      .populate('user', 'name email location')
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Export registrations as CSV
 * @route   GET /api/registrations/event/:eventId/export
 * @access  Private/Admin
 */
const exportEventRegistrations = async (req, res) => {
  try {
    const Event = require('../models/eventModel');
    const exportCSV = require('../utils/exportCSV');
    
    // Verify event belongs to admin
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.createdBy.toString() !== req.admin._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const registrations = await Registration.find({ event: req.params.eventId })
      .populate('user', 'name email')
      .populate('event', 'title')
      .sort({ createdAt: -1 });

    const csv = exportCSV(registrations);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=registrations-${event.title}-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Cancel registration
 * @route   DELETE /api/registrations/:id
 * @access  Private
 */
const cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('event');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Check if user owns this registration
    if (registration.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update event booked seats
    const event = await Event.findById(registration.event._id);
    if (event && event.bookedSeats > 0) {
      event.bookedSeats -= 1;
      await event.save();
    }

    await Registration.deleteOne({ _id: req.params.id });
    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerForEvent,
  confirmPayment,
  getMyRegistrations,
  getEventRegistrations,
  exportEventRegistrations,
  cancelRegistration
};
