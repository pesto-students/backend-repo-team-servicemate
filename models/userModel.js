const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
       name:{type:String,required:true},
       phoneNo:{type:Number,required:true},
       email:{type:String,required:true},
       profileUrl:{type:String,required:true},
       CreaterDate:{type:Date,required:true},
});
const User = mongoose.model("User",userSchema);
module.exports = User;

