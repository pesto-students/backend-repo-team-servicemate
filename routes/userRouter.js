const express = require('express');
const { register, loginUser, appointment, fetchAppointment, addAddress, updateUser, updatePassword } = require('../controllers/userController');
const { protect } = require("../middleware/authMiddleware")
const router = express.Router();


router.route('/register').post(register)
router.route('/login').post(loginUser)
router.route('/appointment').post(protect, appointment)

router.route('/fetchappointment').get(protect, fetchAppointment)
router.route('/addAddress').post(protect, addAddress)
router.route('/forgotpassword').post(updatePassword)
router.route("/sendEmail").post(sendEmail);
module.exports = router



