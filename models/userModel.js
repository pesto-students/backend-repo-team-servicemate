const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phoneNo: {
    type: Number,
    required: true
  },

  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  isVendor: {
    type: Boolean,
    default: false
  },
  address: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
  }],
  profile: {
    type: String
  }
});

userSchema.methods.passwordMatch = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  if (this.isVendor) {
    const ServiceProvider = mongoose.model('ServiceProvider');
    const serviceProvider = new ServiceProvider({
      serviceProviderName: this.name,
      serviceProviderEmailId: this.email,
      isVendor: this.isVendor,
      phoneNo: this.phoneNo,
      profilePic: this.profile,
    });
    await serviceProvider.save();
  }

  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;