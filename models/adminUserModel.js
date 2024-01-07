const mongoose = require('mongoose');
const UserSchema = require('./userModel');
const adminUserSchema = new mongoose.Schema({
    ...UserSchema.obj,
    isAdmin: { type: Boolean, require: true, default: true }
});


const AdminUser = mongoose.model('AdminUser', adminUserSchema);
module.exports = AdminUser;