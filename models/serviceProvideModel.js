const mongoose = require('mongoose');
const serviceProviderModal = new mongoose.Schema({
  serviceProviderName: {
    type: String,
    trim: true,
    required: true
  },

  profilePic: {
    type: String,
  },
  serviceProviderEmailId: {
    type: String,
    trim: true,
    required: true
  },
  isVendor: {
    type: Boolean,
    default: false
  },
  phoneNo: {
    type: Number,
    required: true
  },
  workingAs: {
    type: String,
    enum: ['freelancer', 'vendor'],
    default: 'vendor'
  },
  employeeData: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider'
  }],
  freelancers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider'
  }],
  service: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Services'
  }],
  servicesOffered: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Services'
  }],
  location: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  }],
  openHours: [{
    days: [{
      type: String,
      required: true
    }],
    from: {
      type: String,
      required: true
    },
    to: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  }],
  portfolio: [{
    image: {
      type: String,

    },
    verified: {
      type: Boolean,
    }
  }],
  createdOn: {
    type: Date,
    default: Date.now
  },
  updatedOn: {
    type: Date
  },
  rating: {
    type: Number,
  },
  memberShip: [{
    name: {
      type: String
    },
    expireOn: {
      type: Date,
      required: true
    },
    activatedOn: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive']
    }

  }],
  vendorStatus: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  },
  establishedDate: {
    type: String
  },
  addresses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  }],
});

const ServiceProvider = mongoose.model('ServiceProvider', serviceProviderModal);
module.exports = ServiceProvider;
