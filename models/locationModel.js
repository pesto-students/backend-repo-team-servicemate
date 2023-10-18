const mongoose = require('mongoose');


const locationSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  postalCode: String,
  pinCode: String,
  country: String,
  name: String,
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;