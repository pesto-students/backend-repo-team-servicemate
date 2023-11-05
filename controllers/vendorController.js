const Category = require('../models/categoriesModel');
const ServiceProvider = require('../models/serviceProvideModel');
const Services = require('../models/servicesModel');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const { createResponse, uploadImageToCloudinary } = require('../utils');
const { getLoggedInUserResponseObject } = require('./userController');
const Location = require('../models/locationModel');
// const vendorsByTopCategories = require('./dummyData');


const addService = asyncHandler(async (req, res) => {
  const { params, body, files } = req;
  try {
    const { categories, name, description = '', charges } = body;
    let serviceToBeUpdated;
    const parsedCategories = JSON.parse(categories);
    const existingServices = await Services.findOne({ serviceProviderId: params.vendorId, categories: { $in: [parsedCategories._id] } });
    if (existingServices) {
      existingServices.servicesOffered.push(name);
      serviceToBeUpdated = await existingServices.save();
    }
    else {
      let servicePictures = [];
      if (files?.length) {
        servicePictures = Promise.all(files.map(async (file) => {
          const { secure_url } = await uploadImageToCloudinary(file) || {};
          return secure_url;
        }));
      }

      const serviceProvider = await ServiceProvider.findOne({ _id: params.vendorId });
      serviceToBeUpdated = new Services({
        categories: [parsedCategories._id],
        description: description,
        serviceProvider: serviceProvider.serviceProviderName,
        serviceProviderId: serviceProvider._id,
        charges: charges,
        pictures: servicePictures
      });

      serviceToBeUpdated.servicesOffered.push(name);
      await serviceToBeUpdated.save();
      const result = await (await serviceToBeUpdated.save()).populate({ path: 'categories', model: 'Category' });
      serviceProvider.service.push(result._id);
      await serviceProvider.save();
    }
    res.status(200).json({ message: 'Service registered successfully', data: serviceToBeUpdated });
  }
  catch (error) {
    console.error('Error inserting document:', error);
    res.status(500).json({ message: error });
  }
});

const searchCatagories = asyncHandler(async (req, res) => {
  const { search } = req.query;
  let service;
  try {

    if (!search) {
      service = await Category.find()
        .exec();

    }
    else {
      const regexSearch = new RegExp(search, 'i');
      console.log(regexSearch);
      service = await Category.find({ name: regexSearch });
      console.log('arpit' + service);

    }
    res.status(200).send(service);
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(400).json({ message: 'Error in searching categories', error: error.message });
  }
});

const searchService = asyncHandler(async (req, res) => {
  const { category, price } = req.query;
  console.log(category);

  try {
    let services;
    if (!category.trim() || category === 'all' && !price) {
      services = await Services.find()
        .populate({
          path: 'categories',
          model: 'Category',
        })
        .populate({
          path: 'serviceProviderId',
          model: 'ServiceProvider',
          populate: {
            path: 'location', // Populate the location details within serviceProviderId
            model: 'Location',
          },
        })
        .exec();
    } else {
      const filter = {};
      if (category && category !== 'all') {
        const regexSearch = new RegExp(category, 'i');
        const categories = await Category.find({ value: regexSearch }).select('_id');
        console.log(categories);
        filter.categories = { $in: categories };
        console.log(filter.categories);
      }
      if (price) {
        // Handle price filter
        filter.price = { $lte: parseFloat(price) };
        console.log(filter.price);
      }

      if (price === '0') {
        console.log('zero');
        filter.price = { $lte: '0' };
        console.log(filter.price);
      }


      if (!price) {
        // Handle price filter
        filter.price = { $lte: 2000 };
        console.log(filter.price);// Assuming you want services with price less than or equal to the provided price
      }

      const regexSearch = new RegExp(category, 'i');
      console.log(regexSearch);
      const categories = await Category.find({ value: regexSearch }).select('_id');



      const serviceProvider = await ServiceProvider.find({
        $or: [
          { serviceProviderName: regexSearch },
          { email: regexSearch },

        ],
      }).select('_id');


      console.log(regexSearch, serviceProvider, filter.categories, filter.price);

      services = await Services.find({
        $or: [
          {
            $or: [
              { servicesOffered: regexSearch },
              { serviceProviderId: { $in: serviceProvider } },

            ]
          },
          {
            $and: [
              { categories: { $in: categories } },
              { charge: filter.price }
            ]
          }
        ]
      }).populate({
        path: 'categories',
        model: 'Category',
      })
        .populate({
          path: 'serviceProviderId',
          model: 'ServiceProvider',
          populate: {
            path: 'location', // Populate location details for each service provider
            model: 'Location',
          },
        })
        .exec();


    }
    res.status(200).send(services);

  } catch (error) {
    res.status(400).json({ message: 'error in searching', error: error.message });
  }
});

const vendorDetails = asyncHandler(async (req, res) => {
  let newServiceProvider;
  try {
    const {
      serviceProviderName,
      profilePic,
      serviceProviderEmailId,
      isVendor,
      phoneNo,
      workingAs,
      employeeData,
      service,
      address,
      openHours,
      portfolio,
      rating,
      memberShip,
      status
    } = req.body;

    const serviceProviderExists = await ServiceProvider.findOne({ email });
    console.log(serviceProviderExists);
    if (serviceProviderExists) {
      newServiceProvider = await ServiceProvider.findOneAndUpdate({ email }, {
        $set: {
          serviceProviderName,
          profilePic,
          serviceProviderEmailId,
          isVendor,
          phoneNo,
          workingAs,
          employeeData,
          service,
          address,
          openHours,
          portfolio,
          rating,
          memberShip,
          status
        }
      },
        { new: true }
      );

    }
    else {
      // Create new service provider
      newServiceProvider = await ServiceProvider.create({
        serviceProviderName,
        profilePic,
        isVendor,
        phoneNo,
        workingAs,
        employeeData,
        service,
        address,
        openHours,
        portfolio,
        rating,
        memberShip,
        status
      });



      console.log(newServiceProvider); // Save new service provider
      await newServiceProvider.save();
    }
    if (newServiceProvider) {
      res.status(201).json({ message: 'Service provider created/update successfully', data: newServiceProvider });
    }
    else {
      res.status(400);
      throw new Error('User registration failed.');
    }

  } catch (error) {
    res.status(400).json({ message: 'Error creating service provider', error: error.message });
  }

});
const ProviderDetails = asyncHandler(async (req, res) => {
  const { serviceId, serviceName } = req.body;
  let proivderDeatils;
  if (serviceName) {
    const serviceids = await Services.find({ servicesOffered: { $in: serviceName } });
    const serviceIdArray = serviceids.map(service => service._id);

    console.log(serviceIdArray);
    proivderDeatils = await ServiceProvider.find({ service: { $in: serviceIdArray } })
      .populate({
        path: 'service',
        model: 'Service',
      });
  }
  else {
    proivderDeatils = await ServiceProvider.find({ service: serviceId })
      .populate({
        path: 'service',
        select: 'charges',
      });
  }
  res.send(proivderDeatils);
});


const addEmployee = asyncHandler(async (req, res) => {
  const loginid = req.user.email;

  const { employeeId } = req.body;
  console.log('loggedIn serviceProvider' + loginid);
  if (req.user._id) {
    const service = await ServiceProvider.findOne({ email: loginid });
    if (service) {
      const workingAs = service.workingAs; // Access the workingAs field from the first element of the array
      console.log(workingAs);

      if (workingAs === 'vendor') {

        const employee = await ServiceProvider.find({ _id: employeeId });
        console.log('arpit');
        if (employee) {
          const workingAsForEmployee = employee[0].workingAs;
          console.log(workingAsForEmployee);
          if (workingAsForEmployee == 'freelancer')
            console.log('freelancer');
          service.employeeData.push(employee[0]._id);
          await service.save();
          res.status(200).send('employee added sucessfully.');
        }
        else {
          res.status(400).send('Employee working as other than freelancer.');
        }

      }
      else {
        res.status(400).send('Employee working as other than freelancer.');
      }

    }
    else {
      res.status(400).send('Employee working as other than freelancer.');
    }

  }
  else {
    res.status(400).send('Employee working as other than freelancer.');
  }
}

);


const searchFreelancer = asyncHandler(async (req, res) => {
  const { query } = req;
  try {
    const regexSearch = new RegExp(query.search, 'i');
    const freelancers = await ServiceProvider.find({
      $and: [
        {
          workingAs: 'freelancer'
        },
        {
          $or: [{
            serviceProviderName: { $regex: regexSearch }
          }, {
            email: { $regex: regexSearch }
          }]
        }
      ]
    });
    res.json(createResponse(freelancers));
  }
  catch (error) {
    res.status(500).json(createResponse(error, undefined, true));
  }
});


const getVendorsByTopCategories = async (req, res) => {
  try {
    let results = [];
    const topCategories = await Category.find();



    await Promise.all(topCategories.map(async (category) => {

      // Get the category ID
      const categoryId = category._id;

      // Find services associated with the category
      const serviceIds = await Services.find({ categories: categoryId }).select('_id');

      // Get the services IDs from the services
      // const serviceIds = [...new Set(services.flatMap(service => service._id))];

      // Find vendors that provide the services
      const vendors = await ServiceProvider.find({ service: { $in: serviceIds } }).populate({ path: 'service', model: 'Service' });
      results.push({
        title: `Top ${category.name} nearby`,
        data: vendors.map(({ serviceProviderName, profilePic, rating, service, email, _id }) => ({
          vendorName: serviceProviderName,
          serviceName: service[0].servicesOffered?.join(', '),
          rating,
          charges: service[0].charges,
          image: profilePic,
          email,
          _id: _id
        }))
      });
    }));
    res.json(results);
  }
  catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateVendor = asyncHandler(async (req, res) => {
  const { params, body, query } = req;
  try {
    const userPayload = {
      $set: {
        name: body.name,
        email: body.email,
        phoneNo: body.phoneNo,
      }
    };

    const vendorPayload = {
      $set: {
        serviceProviderName: body.name || body.serviceProviderName,
        workingAs: body.workingAs,
        serviceProviderEmailId: body.email || body.serviceProviderEmailId,
        phoneNo: body.phoneNo,
        establishedDate: body.establishedDate
      }
    };

    if (req.file) {
      const result = await uploadImageToCloudinary(req.file);
      if (result.secure_url) {
        vendorPayload.$set.profilePic = result.secure_url;
      }
    }



    let user = {};
    let vendor = {};
    if (query.v === 'true' || query.v === true) {
      const existingUser = await ServiceProvider.findOne({ _id: params.vendorId }).select('serviceProviderEmailId');
      vendor = await ServiceProvider.findOneAndUpdate({ _id: params.vendorId }, vendorPayload, { new: true });
      user = await User.findOneAndUpdate({ email: existingUser.serviceProviderEmailId }, userPayload, { new: true });
    } else {
      user = await User.findOneAndUpdate({ _id: params.vendorId }, userPayload);
    }

    res.json(createResponse(getLoggedInUserResponseObject((query.v === 'true' || query.v === true) ? vendor : user, (query.v === 'true' || query.v === true))));

  } catch (error) {
    console.error(error);
    res.status(500).json(createResponse(error, undefined, true));
  }
});

const updateVendorServices = asyncHandler((req, res) => {
  const { params, body } = req;

});

const getServicesByVendor = asyncHandler(async (req, res) => {
  const { params } = req;
  try {
    const services = await Services.find({ serviceProviderId: params.vendorId }).populate({ path: 'categories', model: 'Category' });
    res.json(createResponse(services));
  }
  catch (error) {
    res.sendStatus(500).json(createResponse(error, 'Couldn\'t fetch services', true));
  }
});

const updateFreelancer = asyncHandler(async (req, res) => {
  const { params, body } = req;
  try {
    const vendorToBeUpdated = await ServiceProvider.findOne({ _id: params.vendorId });
    vendorToBeUpdated.freelancers.push(body.freelancerId);
    await vendorToBeUpdated.save();
    res.json(createResponse(vendorToBeUpdated));
  } catch (error) {
    res.status(500).json(createResponse(error, undefined, true));
  }
});

const getFreelancersByVendor = asyncHandler(async (req, res) => {
  const { params } = req;
  try {
    const freelancers = await ServiceProvider.findOne({ _id: params.vendorId }).select('freelancers').populate({ path: 'freelancers', model: 'ServiceProvider' }).populate({
      path: 'servicesOffered', model: 'ServiceProvider'
    });
    res.json(createResponse(freelancers?.freelancers || []));
  } catch (error) {
    res.status(500).json(createResponse(error, undefined, true));
  }
});

const updateLocation = asyncHandler(async (req, res) => {
  const { params, body } = req;
  const { addressLine1, addressLine2, city, state, pinCode, country, name, lat, lon } = body;
  try {
    const vendorToBeUpdated = await ServiceProvider.findOne({ _id: params.vendorId });
    if (body._id) {
      await Location.findByIdAndUpdate(body._id, { addressLine1, addressLine2, city, state, pinCode, country, name, longLat: { type: 'Point', coordinates: [lon, lat] } });
    } else {
      const newLocation = await Location.create({
        addressLine1, addressLine2, city, state, pinCode, country, name, longLat: { type: 'Point', coordinates: [lon, lat] }
      });
      await newLocation.save();
      vendorToBeUpdated.location.push(newLocation._id);
      await vendorToBeUpdated.save();
    }
    res.json(createResponse(await vendorToBeUpdated.populate({ path: 'location', model: 'Location' })));
  } catch (error) {
    res.status(500).json(createResponse(error, undefined, true));
  }
});

const updateTimeSlot = asyncHandler(async (req, res) => {
  const { params, body } = req;
  const { days, from, to, name } = body;
  try {
    const vendorToBeUpdated = await ServiceProvider.findOne({ _id: params.vendorId });
    vendorToBeUpdated.openHours.push({ days, from, to, name });
    await vendorToBeUpdated.save();
    res.json(createResponse(await vendorToBeUpdated.populate({ path: 'location', model: 'Location' })));
  } catch (error) {
    res.status(500).json(createResponse(error, undefined, true));
  }
});

const getMyProfile = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  try {
    const vendorProfile = await ServiceProvider.findById(vendorId);
    res.json(createResponse(await vendorProfile.populate({ path: 'location', model: 'Location' })));
  } catch (error) {
    handleError(error, res);
  }
});

const deleteVendorAddress = asyncHandler(async (req, res) => {
  const { vendorId, addressId } = req.params;
  try {
    await Location.findByIdAndDelete(addressId);
    const serviceProviderToBeUpdated = await ServiceProvider.findByIdAndUpdate(vendorId, { $pull: { location: addressId } }, { new: true });
    res.json(createResponse(await serviceProviderToBeUpdated.populate({ path: 'location', model: 'Location' })));
  } catch (error) {
    handleError(error, res);
  }
});

const deleteVendorTimeSlot = asyncHandler(async (req, res) => {
  const { vendorId, slotTimeId } = req.params;
  try {
    const serviceProviderToBeUpdated = await ServiceProvider.findByIdAndUpdate(vendorId, { $pull: { openHours: { _id: slotTimeId } } }, { new: true });
    res.json(createResponse(await serviceProviderToBeUpdated.populate({ path: 'location', model: 'Location' })));
  } catch (error) {
    handleError(error, res);
  }
});

const handleError = (error, res, customMessage) => {
  return res.status(500).json(createResponse(error, customMessage, true));
};

module.exports = {
  searchCatagories,
  addService,
  searchService,
  vendorDetails,
  ProviderDetails,
  addEmployee,
  searchFreelancer,
  getVendorsByTopCategories,
  updateVendor,
  updateVendorServices,
  getServicesByVendor,
  updateFreelancer,
  getFreelancersByVendor,
  updateLocation,
  updateTimeSlot,
  getMyProfile,
  deleteVendorAddress,
  deleteVendorTimeSlot
};
