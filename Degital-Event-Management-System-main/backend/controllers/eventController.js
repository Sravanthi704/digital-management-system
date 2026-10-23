const Event = require('../models/eventModel');
const Registration = require('../models/registrationModel');

/**
 * @desc    Create a new event
 * @route   POST /api/events
 * @access  Private/Admin
 */
const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, category, location, isPaid, price, maxSeats } = req.body;
    
    // Validation
    if (!title || !description || !date || !time || !category || !location || !maxSeats) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (isPaid && (!price || price <= 0)) {
      return res.status(400).json({ message: 'Price is required for paid events' });
    }

    // Get image path if uploaded (Cloudinary URL expected)
    const image = req.body.image || '';

    const event = await Event.create({
      title,
      description,
      date,
      time,
      category,
      location,
      image,
      isPaid: isPaid === true || isPaid === 'true',
      price: isPaid === true || isPaid === 'true' ? Number(price) : 0,
      maxSeats: Number(maxSeats),
      bookedSeats: 0,
      status: 'upcoming',
      createdBy: req.admin._id
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all events (with filters)
 * @route   GET /api/events
 * @access  Public
 */
const getEvents = async (req, res) => {
  try {
    const { category, search, location, date } = req.query;
    let query = {};

    // Filter by category if provided
    if (category) {
      query.category = category;
    }

    // Filter by location if provided
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Filter by date if provided
    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = {
        $gte: searchDate,
        $lt: nextDay
      };
    }

    // Search in title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(query)
      .populate('createdBy', 'name email orgName')
      .sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get single event
 * @route   GET /api/events/:id
 * @access  Public
 */
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email orgName');

    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get events created by admin
 * @route   GET /api/events/admin/my-events
 * @access  Private/Admin
 */
const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.admin._id })
      .populate('createdBy', 'name email orgName')
      .sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update event
 * @route   PUT /api/events/:id
 * @access  Private/Admin
 */
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event belongs to admin
    if (event.createdBy.toString() !== req.admin._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const { title, description, date, time, category, location, isPaid, price, maxSeats, image } = req.body;

    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;
    event.time = time || event.time;
    event.category = category || event.category;
    event.location = location || event.location;
    
    if (image !== undefined) {
      event.image = image;
    }

    if (isPaid !== undefined) {
      event.isPaid = isPaid === true || isPaid === 'true';
    }

    if (price !== undefined && event.isPaid) {
      event.price = Number(price);
    }

    if (maxSeats !== undefined) {
      const newMaxSeats = Number(maxSeats);
      if (newMaxSeats < event.bookedSeats) {
        return res.status(400).json({ message: 'Max seats cannot be less than booked seats' });
      }
      event.maxSeats = newMaxSeats;
    }

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Start event (change status to ongoing)
 * @route   PUT /api/events/:id/start
 * @access  Private/Admin
 */
const startEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event belongs to admin
    if (event.createdBy.toString() !== req.admin._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to start this event' });
    }

    if (event.status === 'ongoing') {
      return res.status(400).json({ message: 'Event is already ongoing' });
    }

    if (event.status === 'completed' || event.status === 'cancelled') {
      return res.status(400).json({ message: `Cannot start event with status: ${event.status}` });
    }

    // Update event status
    event.status = 'ongoing';
    await event.save();

    // Get all paid registrations for this event
    const registrations = await Registration.find({
      event: event._id,
      paymentStatus: 'paid'
    }).populate('user', 'email name');

    // Extract user emails for EmailJS
    const userEmails = registrations.map(reg => ({
      email: reg.user.email,
      name: reg.user.name,
      ticketCode: reg.ticketCode
    }));

    res.json({
      message: 'Event started successfully',
      event,
      userEmails // Send to frontend for EmailJS
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Cancel event
 * @route   PUT /api/events/:id/cancel
 * @access  Private/Admin
 */
const cancelEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event belongs to admin
    if (event.createdBy.toString() !== req.admin._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this event' });
    }

    event.status = 'cancelled';
    await event.save();

    res.json({ message: 'Event cancelled successfully', event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete event
 * @route   DELETE /api/events/:id
 * @access  Private/Admin
 */
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event belongs to admin
    if (event.createdBy.toString() !== req.admin._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await Event.deleteOne({ _id: req.params.id });
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  getMyEvents,
  updateEvent,
  startEvent,
  cancelEvent,
  deleteEvent
};
