const express = require('express');
const { protect } = require("../middleware/authMiddleware")
const { searchCatagories, categoriesRegistration, vendorDetails, searchService, ProviderDetails, addEmployee, searchFreelancer, getVendorsByTopCategories, updateVendor } = require('../controllers/vendorController');

const router = express.Router();


router.route('/categories').get(searchCatagories);
router.route('/serviceSearch').get(searchService);
router.route('/serviceFreelancers').get(protect, searchFreelancer);


router.route('/').post(protect, categoriesRegistration).put(protect, categoriesRegistration)
router.route('/detail').post(vendorDetails);
router.route("/add-employee").post(protect, addEmployee)
router.route('/servceProviderDetails').post(ProviderDetails)

router.route('/vendorsByTopCategories').get(getVendorsByTopCategories)

//put routes
router.route("/updateVendor/:userId").put(updateVendor)

module.exports = router;


