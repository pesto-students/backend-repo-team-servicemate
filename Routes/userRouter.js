const express = require('express');
const { register, login, appointment, fetchAppointment,addAddress } = require('../controllers/userController');
const { protect } = require("../middleware/authMiddleware")
const router = express.Router();


router.route('/register').post(register)
router.route('/login').post(login)
router.route('/appointment').post(protect, appointment)

router.route('/fetchappointment').get(protect, fetchAppointment)
router.route('/addAddress').post(protect,addAddress)
module.exports = router

 

