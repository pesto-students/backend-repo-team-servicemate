const mongoose = require("mongoose");


const appointmentSchema = new mongoose.Schema({
  serviceProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceProvider",
    required: true
  },
  serviderProviderName:{
     type:String,
     required: true
  },

  service: {
    type: String,
    required: true
  },
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  userName: {
    type: String,
    required: true
   
  },
  userAddress:{
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  time:{
    type: String,
    required: true
  },
  BookingDate:{
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed","cancelled","reschedule"],
    default: "pending"
  },
  payment:{
    type: String,
    enum: ["pending", "partiallyPaid", "paid"],
    default: "pending"
  }

});

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;