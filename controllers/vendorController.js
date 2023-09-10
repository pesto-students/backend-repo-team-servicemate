const Category = require('../models/categoriesModel');
const ServiceProvider = require('../models/serviceProvideModel');
const Services = require('../models/servicesModel');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const { createResponse } = require('../utils');
// const vendorsByTopCategories = require('./dummyData');


const addService = asyncHandler(async (req, res) => {
  const { params, body } = req
  try {
    const { categories, name, description = '', charges } = body;
    let serviceToBeUpdated

    const existingServices = await Services.findOne({ serviceProviderId: params.vendorId, categories: { $in: [categories._id] } })
    if (existingServices) {
      existingServices.servicesOffered.push(name)
      serviceToBeUpdated = await existingServices.save()
    }
    else {
      const serviceProvider = await ServiceProvider.findOne({ _id: params.vendorId });
      serviceToBeUpdated = await new Services({
        categories: [categories._id],
        description: description,
        serviceProvider: serviceProvider.serviceProviderName,
        serviceProviderId: serviceProvider._id,
        charges: charges
      });

      serviceToBeUpdated.servicesOffered.push(name)
      await serviceToBeUpdated.save()
      const result = await (await serviceToBeUpdated.save()).populate({ path: "categories", model: "Category" })
      serviceProvider.service.push(result._id);
      await serviceProvider.save();
    }
    res.status(200).json({ message: "Service registered successfully", data: serviceToBeUpdated });
  }
  catch (error) {
    console.error('Error inserting document:', error);
    res.status(500).json({ message: error });
  }
})

const searchCatagories = asyncHandler(async (req, res) => {
  const { search } = req.query;
  let service;
  try {

    if (!search) {
      service = await Category.find()
        .exec();

    }
    else {
      const regexSearch = new RegExp(search, "i");
      console.log(regexSearch);
      service = await Category.find({ name: regexSearch });
      console.log("arpit" + service)

    }
    res.status(200).send(service);
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(400).json({ message: 'Error in searching categories', error: error.message });
  }
});

const searchService = asyncHandler(async (req, res) => {
  const { category, price } = req.query;
  console.log(category);

  try {
    let services;
    if (!category.trim() || category === "all" && !price) {
      services = await Services.find()
        .populate({
          path: "categories",
          model: "Category",
        })
        .populate({
          path: "serviceProviderId",
          model: "ServiceProvider",
          populate: {
            path: "location", // Populate the location details within serviceProviderId
            model: "Location",
          },
        })
        .exec();
    } else {
      const filter = {};
      if (category && category !== "all" || category) {
        const regexSearch = new RegExp(category, "i");
        const categories = await Category.find({ value: regexSearch }).select('_id');
        console.log(categories)
        filter.categories = { $in: categories };
        console.log(filter.categories)

      }
      if (price) {
        // Handle price filter
        filter.price = { $lte: parseFloat(price) };
        console.log(filter.price)// Assuming you want services with price less than or equal to the provided price
      }
      const regexSearch = new RegExp(category, "i");
      console.log(regexSearch);
      const categories = await Category.find({ value: regexSearch }).select('_id');



      const serviceProvider = await ServiceProvider.find({
        $or: [
          { serviceProviderName: regexSearch },
          { serviceProviderEmalId: regexSearch },

        ],
      }).select('_id');


      console.log(regexSearch, serviceProvider, filter.categories, filter.price)

      services = await Services.find({
        $or: [
          { services: regexSearch },
          { serviceProviderId: { $in: serviceProvider } },
          { categories: { $in: categories } },
          { price: filter.price }
        ],
        $and: [
          { price: filter.price },
          { categories: { $in: categories } }
        ],
      }).populate({
        path: "categories",
        model: "Category",
      })
        .populate({
          path: "serviceProviderId",
          model: "ServiceProvider",
          populate: {
            path: "location", // Populate location details for each service provider
            model: "Location",
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
      serviceProviderEmalId,
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

    const serviceProviderExists = await ServiceProvider.findOne({ serviceProviderEmalId });
    console.log(serviceProviderExists)
    if (serviceProviderExists) {
      newServiceProvider = await ServiceProvider.findOneAndUpdate({ serviceProviderEmalId }, {
        $set: {
          serviceProviderName,
          profilePic,
          serviceProviderEmalId,
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



      console.log(newServiceProvider) // Save new service provider
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
  const { serviceId, serviceName } = req.body
  let proivderDeatils
  if (serviceName) {
    const serviceids = await Services.find({ services: { $in: serviceName } })
    const serviceIdArray = serviceids.map(service => service._id)

    console.log(serviceIdArray)
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

  const { employeeId } = req.body
  console.log("loggedIn serviceProvider" + loginid)
  if (req.user._id) {
    const service = await ServiceProvider.findOne({ serviceProviderEmalId: loginid })
    if (service) {
      const workingAs = service.workingAs; // Access the workingAs field from the first element of the array
      console.log(workingAs);

      if (workingAs === "vendor") {

        const employee = await ServiceProvider.find({ _id: employeeId })
        console.log("arpit")
        if (employee) {
          const workingAsForEmployee = employee[0].workingAs;
          console.log(workingAsForEmployee)
          if (workingAsForEmployee == "freelancer")
            console.log("freelancer")
          service.employeeData.push(employee[0]._id)
          await service.save();
          res.status(200).send("employee added sucessfully.")
        }
        else {
          res.status(400).send("Employee working as other than freelancer.");
        }

      }
      else {
        res.status(400).send("Employee working as other than freelancer.");
      }

    }
    else {
      res.status(400).send("Employee working as other than freelancer.");
    }

  }
  else {
    res.status(400).send("Employee working as other than freelancer.");
  }
}

);


const searchFreelancer = asyncHandler(async (req, res) => {
  const { query } = req
  try {
    const regexSearch = new RegExp(query.search, "i");
    const freelancers = await ServiceProvider.find({
      workingAs: "freelancer", $or: [{
        serviceProviderName: regexSearch, serviceProviderEmalId: regexSearch
      }]
    })
    res.json(createResponse(freelancers))
  }
  catch (error) {
    res.status(500).json(createResponse(error, undefined, true))
  }
});


const getVendorsByTopCategories = async (req, res) => {
  try {
    let results = []
    const topCategories = await Category.find()



    await Promise.all(topCategories.map(async (category) => {

      // Get the category ID
      const categoryId = category._id;

      // Find services associated with the category
      const serviceIds = await Services.find({ categories: categoryId }).select("_id");

      // Get the services IDs from the services
      // const serviceIds = [...new Set(services.flatMap(service => service._id))];

      // Find vendors that provide the services
      const vendors = await ServiceProvider.find({ service: { $in: serviceIds } }).populate({ path: "service", model: "Service" })
      results.push({
        title: `Top ${category.name} nearby`,
        data: vendors.map(({ serviceProviderName, profilePic, rating, service, serviceProviderEmalId }) => ({
          vendorName: serviceProviderName,
          serviceName: service[0].services?.join(", "),
          rating,
          charges: service[0].charges,
          image: profilePic,
          serviceProviderEmalId
        }))
      });
    }))
    res.json(results)
  }
  catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

const updateVendor = asyncHandler(async (req, res) => {
  const { params, body } = req
  try {
    const filter = { _id: params.vendorId };

    const userPayload = {
      $set: {
        name: body.name,
        email: body.email,
        phoneNo: body.phoneNo,
      }
    };

    const vendorPayload = {
      $set: {
        serviceProviderName: body.name,
        workingAs: body.workingAs,
        serviceProviderEmalId: body.email,
        phoneNo: body.phoneNo,
      }
    };
    const oldUser = await User.findOne({ _id: params.vendorId }).select("email")
    const user = await User.findOneAndUpdate(filter, userPayload, { new: true })
    const vendor = await ServiceProvider.findOneAndUpdate({ serviceProviderEmalId: oldUser.email }, vendorPayload, { new: true })
    res.json({ message: "Profile updated successfully", data: { user, vendor } })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
})

const updateVendorServices = asyncHandler((req, res) => {
  const { params, body } = req

})

const getServicesByVendor = asyncHandler(async (req, res) => {
  const { params } = req
  try {
    const services = await Services.find({ serviceProviderId: params.vendorId }).populate({ path: "categories", model: "Category" })
    res.json(createResponse(services))
  }
  catch (error) {
    res.sendStatus(500).json(createResponse(error, "Couldn't fetch services", true))
  }
})

const updateFreelancer = asyncHandler(async (req, res) => {
  const { params, body } = req
  try {
    const vendorToBeUpdated = await ServiceProvider.findOne({ _id: params.vendorId })
    vendorToBeUpdated.freelancers.push(body.freelancerId)
    vendorToBeUpdated.save()
    res.json(createResponse(vendorToBeUpdated))
  } catch (error) {
    res.status(500).json(createResponse(error, undefined, true))
  }
})

const getFreelancersByVendor = asyncHandler(async (req, res) => {
  const { params } = req
  try {
    const freelancers = await ServiceProvider.findOne({ _id: params.vendorId }).select("freelancers").populate({ path: "freelancers", model: 'ServiceProvider' }).populate({
      path: 'servicesOffered', model: "ServiceProvider"
    })
    res.json(createResponse(freelancers.freelancers))
  } catch (error) {
    res.status(500).json(createResponse(error, undefined, true))
  }
})

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
  getFreelancersByVendor
};
