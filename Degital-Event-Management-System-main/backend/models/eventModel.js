const mongoose = require('mongoose');

/**
 * Event Model
 * Stores event information including paid/free status, pricing, and booking details
 */
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Please provide a date']
  },
  time: {
    type: String,
    required: [true, 'Please provide a time']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Please provide a location'],
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  maxSeats: {
    type: Number,
    required: [true, 'Please provide maximum seats'],
    min: 1
  },
  bookedSeats: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
