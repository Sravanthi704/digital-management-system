const mongoose = require('mongoose');

/**
 * Registration Model
 * Tracks user registrations for events with payment status and ticket codes
 */
const registrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'unpaid'],
    default: 'unpaid'
  },
  ticketCode: {
    type: String,
    unique: true,
    sparse: true // Allows null values but enforces uniqueness when present
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate registrations
registrationSchema.index({ user: 1, event: 1 }, { unique: true });

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;
