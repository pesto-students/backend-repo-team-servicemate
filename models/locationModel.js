const mongoose = require('mongoose');


const locationSchema = new mongoose.Schema({
  street: String,
  addressLine1: String,
  addressLine2: String,
  city: String,
  state: String,
  postalCode: String,
  pinCode: String,
  country: String,
  name: String,
  longLat: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [Number]
  }
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;