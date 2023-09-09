const express = require('express');
const { protect } = require("../middleware/authMiddleware")
const { searchCatagories, addService, vendorDetails, searchService, ProviderDetails, addEmployee, searchFreelancer, getVendorsByTopCategories, updateVendor,
    updateVendorServices, getServicesByVendor } = require('../controllers/vendorController');

const router = express.Router();

//get routes
router.route('/categories').get(searchCatagories);
router.route('/serviceSearch').get(searchService);
router.route('/serviceFreelancers').get(protect, searchFreelancer);
router.route('/vendorsByTopCategories').get(getVendorsByTopCategories)
router.route('/services/:vendorId').get(getServicesByVendor)

//post routes
router.route("/addService/:vendorId").post(addService)
router.route('/detail').post(vendorDetails);
router.route("/add-employee").post(protect, addEmployee)
router.route('/servceProviderDetails').post(ProviderDetails)

//put routes
router.route("/updateVendor/:vendorId").put(updateVendor)
router.route("/updateVendorServices/:vendorId").put(updateVendorServices)

module.exports = router;


