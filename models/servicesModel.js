const mongoose = require('mongoose');


const serviceSchema = new mongoose.Schema({
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  service: [String],
  servicesOffered: [String],
  description: {
    type: String,

  },
  address: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
  }],
  serviceProvider: {
    type: String,
  },
  serviceProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true
  },
  charges: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: false,
    default: 1000
  },
  pictures: {
    type: [String],
  }

});
const Services = mongoose.model('Service', serviceSchema);
module.exports = Services;
