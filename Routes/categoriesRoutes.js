const express = require('express');
const { getTopCategories, addCategory, } = require("../controllers/categoriesController");
const { upload } = require('../config/cloudinary');

const router = express.Router();

router.route("/topCategories").get(getTopCategories)

router.route("/addCategory").post(upload.single('image'), addCategory)

module.exports = router