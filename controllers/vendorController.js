const Category = require('../models/categoriesModel');
const ServiceProvider = require('../models/serviceProvideModel');
const Services = require('../models/servicesModel');
const asyncHandler = require('express-async-handler');
// const vendorsByTopCategories = require('./dummyData');


const categoriesRegistration = asyncHandler(async (req, res) => {
  console.log(req.user.email)
  const { categoryName, services, description, price } = req.body;
  const serviceProvider1 = await ServiceProvider.findOne({ email: req.user.email });
  console.log(serviceProvider1)
  // const serviceProvider= req.user._id;
  //  const serviceProviderId = serviceProvider.toString();
  console.log(serviceProvider1.serviceProviderName)
  console.log(categoryName)
  const existingCategory = await Category.findOne({ value: categoryName });

  let categoryId = existingCategory._id

  
  // if (existingCategory) {
  // If the category exists, retrieve its ID
  // } else {
  // const newCategory = await Category.create({ name: categories,value:categories.trim().toLowerCase() });
  // categoryId = newCategory._id;
  // }
  const service = await new Services({
    categories: categoryId,
    servicesOffered: services,
    description: description,
    serviceProvider: serviceProvider1.serviceProviderName,
    serviceProviderId: serviceProvider1._id,
    charge: price

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
  const { category,price } = req.query;
  console.log(category,price)
  console.log((!category || category === "all") && (!price))
  try {
    let services;
    if ((!category || category === "all") && (!price)) {
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
      if (category && category !== "all" ||category) {
        const regexSearch = new RegExp(category, "i");
        const categories = await Category.find({ value: regexSearch }).select('_id');
        console.log(categories)
        filter.categories ={ $in: categories };
        console.log(filter.categories)
      }
      if (price) {
        // Handle price filter
        filter.price = { $lte: parseFloat(price) }; 
        console.log(filter.price)
      }

      if (!price) {
        // Handle price filter
        filter.price = { $lte: 2000 }; 
        console.log(filter.price)// Assuming you want services with price less than or equal to the provided price
      }
      
      const regexSearch = new RegExp(category, "i");
      console.log(regexSearch);
      const categories = await Category.find({ value: regexSearch }).select('_id');

     

      const serviceProvider = await ServiceProvider.find({
        $or: [
          { serviceProviderName: regexSearch },
          { email: regexSearch },
    
        ],
      }).select('_id');


   console.log(regexSearch,serviceProvider,filter.categories,filter.price)

   services = await Services.find({
    $or: [
      {
        $and: [
          { servicesOffered: regexSearch },
          {
            $or: [
              { serviceProviderId: { $in: serviceProvider } },
              { categories: { $in: categories } },
              { charge: filter.price }
            ]
          }
        ]
      },
      {
        $and: [
          {
            $or: [
              { categories: { $in: categories } },
              { charge: filter.price }
            ]
          },
          {
            $or: [
              { categories: { $in: categories } },
              { charge: filter.price }
            ]

          }
        ]
      },
      
    ]
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
      email,
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

    const serviceProviderExists = await ServiceProvider.findOne({ email });
    console.log(serviceProviderExists)
    if (serviceProviderExists) {
      newServiceProvider = await ServiceProvider.findOneAndUpdate({ email }, {
        $set: {
          serviceProviderName,
          profilePic,
          email,
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
    const serviceids = await Services.find({ servicesOffered: { $in: serviceName } })
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
        select: 'price',
      });
  }
  res.send(proivderDeatils);
});


const addEmployee = asyncHandler(async (req, res) => {
  const loginid = req.user.email;

  const { employeeId } = req.body
  console.log("loggedIn serviceProvider" + loginid)
  if (req.user._id) {
    const service = await ServiceProvider.findOne({ email: loginid })
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
    const service = await ServiceProvider.find({ email: loginid })



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
              { email: regexSearch }
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
        data: vendors.map(({ serviceProviderName, profilePic, rating, service, email }) => ({
          vendorName: serviceProviderName,
          serviceName: service[0].servicesOffered?.join(", "),
          rating,
          charges: service[0].price,
          image: profilePic,
          email
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

  const filter = { key: params.userId };

  const userPayload = {
    $set: {
      name: body.name,
      email: body.email,
      phoneNo: body.phoneNo,
    }
  };

  const vendorPayload = {
    $set: {
      name: body.name,
      workingAs: body.workingAs,
      email: body.email,
      phoneNo: body.phoneNo,
    }
  };
  try {
    const user = await ServiceProvider.updateOne(filter, userPayload)
    const vendor = await ServiceProvider.updateOne(filter, vendorPayload)
    console.log(user,vendor)
    res.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error(error);
  }
})



module.exports = { searchCatagories, categoriesRegistration, searchService, vendorDetails, ProviderDetails, addEmployee, searchFreelancer, getVendorsByTopCategories, updateVendor };
