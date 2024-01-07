const mongoose = require('mongoose');


const appointmentSchema = new mongoose.Schema({
  serviceProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true
  },
  serviceProviderName: {
    type: String,
    required: true
  },

  service: {
    type: String,
    // required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true
  },
  userName: {
    type: String,
    // required: true

  },
  userAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  appointmentDate: {
    type: Date,
    // required: true
  },
  time: {
    type: String,
    // required: true
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
    default: 'pending'
  },
  payment: {
    type: String,
    enum: ['pending', 'partiallyPaid', 'paid'],
    default: 'pending'
  },
  userEmailId: {
    type: String,
    required: true
  }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;