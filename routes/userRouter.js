const express = require('express');
const { register, loginUser, bookAppointment, fetchAppointment, addAddress, updateUser, updatePassword, sendEmail, updateAppointments } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

//post routes
router.route('/register').post(register);
router.route('/login').post(loginUser);
router.route('/bookAppointment').post(protect, bookAppointment);
router.route('/sendEmail').post(sendEmail);
router.route('/addAddress').post(protect, addAddress);
router.route('/forgotpassword').post(updatePassword);

//get routes
router.route('/fetchAppointments/:userId').get(fetchAppointment);

//put routes
router.route('/updateAppointment/:userId').put(updateAppointments);

module.exports = router;



