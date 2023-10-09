const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { searchCatagories, addService, vendorDetails, searchService, ProviderDetails, addEmployee, searchFreelancer, getVendorsByTopCategories, updateVendor,
    updateVendorServices, getServicesByVendor, updateFreelancer, getFreelancersByVendor, updateLocation, updateTimeSlot } = require('../controllers/vendorController');
const { upload } = require('../config/cloudinary');

const router = express.Router();

//get routes
router.route('/categories').get(searchCatagories);
router.route('/serviceSearch').get(searchService);
router.route('/searchFreelancer').get(searchFreelancer);
router.route('/vendorsByTopCategories').get(getVendorsByTopCategories);
router.route('/services/:vendorId').get(getServicesByVendor);
router.route('/freelancers/:vendorId').get(getFreelancersByVendor);

//post routes
router.route('/addService/:vendorId').post(addService);
router.route('/detail').post(vendorDetails);
router.route('/add-employee').post(protect, addEmployee);
router.route('/serviceProviderDetails').post(ProviderDetails);

//put routes
router.route('/updateVendorProfile/:vendorId').put(upload.single('profilePic'), updateVendor);
router.route('/updateVendorServices/:vendorId').put(upload.single('profilePic'), updateVendorServices);
router.route('/updateFreelancer/:vendorId').put(updateFreelancer);
router.route('/updateLocation/:vendorId').put(updateLocation);
router.route('/updateTimeSlot/:vendorId').put(updateTimeSlot);

module.exports = router;


