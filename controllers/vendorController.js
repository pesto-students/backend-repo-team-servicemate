const Category = require('../models/categoriesModel');
const ServiceProvider = require('../models/serviceProvideModel');
const Services = require('../models/servicesModel');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
// const vendorsByTopCategories = require('./dummyData');


const categoriesRegistration = asyncHandler(async (req, res) => {
  console.log(req.user.email)
  const { categoryName, services, description, charges } = req.body;
  const serviceProvider1 = await ServiceProvider.findOne({ serviceProviderEmalId: req.user.email });
  console.log(serviceProvider1)
  // const serviceProvider= req.user._id;
  //  const serviceProviderId = serviceProvider.toString();
  console.log(serviceProvider1.serviceProviderName)
  const existingCategory = await Category.findOne({ name: categoryName });

  let categoryId = existingCategory._id
  // if (existingCategory) {
  // If the category exists, retrieve its ID
  // } else {
  // const newCategory = await Category.create({ name: categories,value:categories.trim().toLowerCase() });
  // categoryId = newCategory._id;
  // }
  const service = await new Services({
    categories: categoryId,
    services: services,
    description: description,
    serviceProvider: serviceProvider1.serviceProviderName,
    serviceProviderId: serviceProvider1._id,
    charges: charges

  });

  await service.save()
    .then(async (result) => {
      console.log('Document inserted:', result);
      serviceProvider1.service.push(result._id);
      await serviceProvider1.save();
      res.status(200).json({ message: "Service registered successfully" });
    })
    .catch((error) => {
      console.error('Error inserting document:', error);
      res.status(500).json({ error: error.message });
    });

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
  const { category } = req.query;
  console.log(category);

  try {
    let services;
    if (!category.trim() || category === "all") {
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
      const regexSearch = new RegExp(category, "i");
      console.log(regexSearch);

      const categories = await Category.find({
        name: regexSearch
      }).select('_id');
      console.log("catagory" + categories);

      const serviceProvider = await ServiceProvider.find({
        $or: [
          { serviceProviderName: regexSearch },
          { serviceProviderEmalId: regexSearch },
          //       { charges: { $gte: parseFloat(charges), $lte: parseFloat(charges) } },
        ],
      }).select('_id');
      console.log("serviceProviderId" + serviceProvider, regexSearch);

      services = await Services.find({
        $or: [
          { services: regexSearch },
          { serviceProviderId: { $in: serviceProvider } },
          { categories: { $in: categories } },
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
      userType,
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
          userType,
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
        userType,
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
  const loginid = req.user.email;
  console.log(loginid)
  const { search } = req.query;
  let freelancerSearch;

  if (req.user._id) {
    const service = await ServiceProvider.find({ serviceProviderEmalId: loginid })



    if (service.length > 0) {
      console.log("inseide" + service.length)
      const workingAs = service[0].workingAs; // Access the workingAs field from the first element of the array

      if (workingAs == "vendor") {
        if (!search) {

          freelancerSearch = await ServiceProvider.find({ workingAs: "freelancer" })
        }
        else {
          const regexSearch = new RegExp(search, "i");
          freelancerSearch = await ServiceProvider.find({
            $or: [
              { serviceProviderName: regexSearch },
              { serviceProviderEmalId: regexSearch }
            ],

            workingAs: { $in: ["freelancer", "Freelancer"] }


          })

          res.status(200).send(freelancerSearch);
        }
      }
      else {
        res.status(400).send("Service provider is not a vendor.");
      }
    } else {
      res.status(404).send("Service provider not found.");
    }
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
    const filter = { _id: params.userId };

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
    const oldUser = await User.findOne({ _id: params.userId }).select("email")
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

module.exports = {
  searchCatagories,
  categoriesRegistration,
  searchService,
  vendorDetails,
  ProviderDetails,
  addEmployee,
  searchFreelancer,
  getVendorsByTopCategories,
  updateVendor,
  updateVendorServices
};
