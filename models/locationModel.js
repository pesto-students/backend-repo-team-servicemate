const mongoose = require('mongoose');


const locationSchema = new mongoose.Schema({
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    name: String,
  }

});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;