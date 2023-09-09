const mongoose = require("mongoose");


const serviceSchema = new mongoose.Schema({
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category"
  }],
  services: [String],
  description: {
    type: String,

  },
  address: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
  }],
  serviceProvider: {
    type: String,
  },
  serviceProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceProvider",
    required: true
  },
  charges: {
    type: Number,
    required: true
  },
  servicesOffered: [String]
});
const Services = mongoose.model("Service", serviceSchema);
module.exports = Services;
