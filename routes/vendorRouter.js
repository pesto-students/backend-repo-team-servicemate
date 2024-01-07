const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { searchCatagories, addService, vendorDetails, searchService, ProviderDetails, addEmployee, searchFreelancer, getVendorsByTopCategories, updateVendor,
    updateVendorServices, getServicesByVendor, updateFreelancer, getFreelancersByVendor, updateLocation, updateTimeSlot, getMyProfile, deleteVendorAddress,
    deleteVendorTimeSlot, getVendorsByCategories, getAllVendors, updateVendorStatus } = require('../controllers/vendorController');
const { upload } = require('../config/cloudinary');

const router = express.Router();

//get routes
router.route('/categories').get(searchCatagories);
router.route('/serviceSearch').get(searchService);
router.route('/searchFreelancer').get(searchFreelancer);
router.route('/vendorsByTopCategories').get(getVendorsByTopCategories);
router.route('/services/:vendorId').get(getServicesByVendor);
router.route('/freelancers/:vendorId').get(getFreelancersByVendor);
router.route('/myProfile/:vendorId').get(getMyProfile);
router.route('/allVendors/:category').get(getVendorsByCategories);
router.route('/:id/allVendors').get(getAllVendors);

//post routes
router.route('/addService/:vendorId').post(upload.array('file', 5), addService);
router.route('/detail').post(vendorDetails);
router.route('/add-employee').post(protect, addEmployee);
router.route('/serviceProviderDetails').post(ProviderDetails);

//put routes
router.route('/updateVendorProfile/:vendorId').put(upload.single('profilePic'), updateVendor);
router.route('/updateVendorServices/:vendorId').put(upload.single('profilePic'), updateVendorServices);
router.route('/updateFreelancer/:vendorId').put(updateFreelancer);
router.route('/updateLocation/:vendorId').put(updateLocation);
router.route('/updateTimeSlot/:vendorId').put(updateTimeSlot);
router.route('/updateVendorStatus/:adminId').put(updateVendorStatus);


//delete routes
router.route('/:vendorId/deleteAddress/:addressId').delete(deleteVendorAddress);
router.route('/:vendorId/deleteTimeSlot/:slotTimeId').delete(deleteVendorTimeSlot);

module.exports = router;


