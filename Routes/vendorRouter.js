const express = require('express');
const {protect}= require("../middleware/authMiddleware")
const { searchCatagories, catagoriesRegistration,vendorDetails, searchService,ProviderDetails,addEmployee,searchFreelancer } = require('../controllers/vendorController');

const router = express.Router();


router.route('/catagories').get(searchCatagories);
router.route('/serviceSearch').get(searchService);
router.route('/serviceFreelancers').get(protect,searchFreelancer);


router.route('/').post(protect,catagoriesRegistration).put(protect,catagoriesRegistration)
router.route('/detail').post(vendorDetails);
router.route("/add-employee").post(protect,addEmployee)
router.route('/servceProviderDetails').post(ProviderDetails)



module.exports = router;


