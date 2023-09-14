const express = require('express');
const { register, login, appointment, fetchAppointment, addAddress, updatePassword, sendEmail } = require('../controllers/userController');
const { protect } = require("../middleware/authMiddleware")
const router = express.Router();


router.route('/register').post(register)
router.route('/login').post(login)
router.route('/appointment').post(protect, appointment)

router.route('/fetchappointment').get(protect, fetchAppointment)
router.route('/addAddress').post(protect, addAddress)
router.route('/forgotpassword').post(updatePassword)
router.route("/sendEmail").post(sendEmail);
module.exports = router



