const express = require('express');
const { protect } = require("../middleware/authMiddleware")
const { searchCatagories, addService, vendorDetails, searchService, ProviderDetails, addEmployee, searchFreelancer, getVendorsByTopCategories, updateVendor,
    updateVendorServices, getServicesByVendor, updateFreelancer, getFreelancersByVendor } = require('../controllers/vendorController');

const router = express.Router();

//get routes
router.route('/categories').get(searchCatagories);
router.route('/serviceSearch').get(searchService);
router.route('/searchFreelancer').get(searchFreelancer);
router.route('/vendorsByTopCategories').get(getVendorsByTopCategories)
router.route('/services/:vendorId').get(getServicesByVendor)
router.route('/freelancers/:vendorId').get(getFreelancersByVendor)

//post routes
router.route("/addService/:vendorId").post(addService)
router.route('/detail').post(vendorDetails);
router.route("/add-employee").post(protect, addEmployee)
router.route('/servceProviderDetails').post(ProviderDetails)

//put routes
router.route("/updateVendor/:vendorId").put(updateVendor)
router.route("/updateVendorServices/:vendorId").put(updateVendorServices)
router.route("/updateFreelancer/:vendorId").put(updateFreelancer)

module.exports = router;


