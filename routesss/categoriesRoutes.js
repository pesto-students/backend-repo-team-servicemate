const express = require('express');
const { getTopCategories, addCategory, deleteCategory, updateCategory, } = require("../controllers/categoriesController");
const { upload } = require('../config/cloudinary');

const router = express.Router();

//get routes
router.route("/topCategories").get(getTopCategories)

//post routes
router.route("/addCategory").post(upload.single('image'), addCategory)

//put routes
router.route("/updateCategory").put(upload.single('image'), updateCategory)

//delete routes
router.route("/deleteCategory/:id").delete(deleteCategory)

module.exports = router