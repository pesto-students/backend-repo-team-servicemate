const mongoose = require('mongoose');
const HouseholdWorkCategories = ['plumbing', 'electrician', 'gardening', 'cleaning', 'painting'];
const categorySchema = new mongoose.Schema({
    catagories:{
        type: String,
        enum: HouseholdWorkCategories,
        required: true,
         
       },
       images:{
        type: String,
        default:"https://img.freepik.com/premium-photo/repairman-holds-screwdriver-suitcase-tools-kitchen-looks-camera_353017-487.jpg?w=740"

       }
  });
  
  const Category = mongoose.model('Category', categorySchema);
  module.exports = Category;