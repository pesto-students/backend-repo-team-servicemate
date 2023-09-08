const mongoose = require('mongoose');
const HouseholdWorkCategories = ['plumbing', 'electrician', 'gardening', 'cleaning', 'painting'];
const HouseholdWorkCategoriesLabel = ['Plumbing', 'Electrician', 'Gardening', 'Cleaning', 'Painting'];

const categorySchema = new mongoose.Schema({
    images: {
        type: String,
        default: "https://img.freepik.com/premium-photo/repairman-holds-screwdriver-suitcase-tools-kitchen-looks-camera_353017-487.jpg?w=740"

    },
    name: {
        type: String,
        enum: HouseholdWorkCategoriesLabel,
        required: true,
    },
    value: {
        type: String,
        enum: HouseholdWorkCategories,
    },
    image: {
        type: String,
    }
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;