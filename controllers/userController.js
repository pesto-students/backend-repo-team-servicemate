const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../config/generateToken');
const ServiceProvider = require('../models/serviceProvideModel');
const Appointment = require('../models/appointmentBookingModel ');
const Location = require('../models/locationModel');
const { createResponse } = require('../utils');


const register = asyncHandler(async (req, res) => {
  const { name, phoneNo, email, password, isVendor = false, profile } = req.body;

  // Check if all required fields are provided
  if (!name || !phoneNo || !email || !password) {
    res.status(400);
    throw new Error('Please provide all the required information.');
  }

  // Check if the user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(403);
    throw new Error('User already exists.');
  }

  // Create a new user
  const newUser = await User.create({
    name,
    phoneNo,
    email,
    password,
    isVendor,
    profile
  });

  if (newUser) {
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      phoneNo: newUser.phoneNo,
      email: newUser.email,
      isVendor: newUser.isVendor,
      address: newUser.address,
      profile: newUser.profile,
      token: generateToken(newUser._id)
    });
  } else {
    res.status(400);
    throw new Error('User registration failed.');
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("please enter details correctly login");
  }
  let authUser
  authUser = await ServiceProvider.findOne({ serviceProviderEmalId: email }).populate({ path: 'location', model: "Location" });
  if (!authUser) {
    authUser = await User.findOne({ email }).populate({
      path: "address",
      model: "Location"
    })
  }
  const userPassword = await User.findOne({ email }).select("password")
  if (authUser && (await userPassword.passwordMatch(password))) {
    const { isVendor } = authUser;
    res.status(200).json(getLoggedInUserResponseObject(authUser, isVendor, true))
  } else {
    res.send(400).json(createResponse({ error: "Either email id or password doesn't match" }))
  }
});

const getLoggedInUserResponseObject = (authUser, isVendor, isTokenRequired) => {
  let responseObject = {
    _id: authUser._id,
    name: authUser.name,
    email: authUser.email,
    phoneNo: authUser.phoneNo,
    address: authUser.address
  }

  if (isTokenRequired) {
    responseObject.token = generateToken(authUser._id)
  }

  if (isVendor) {
    responseObject = {
      ...responseObject, name: authUser.serviceProviderName, email: authUser.serviceProviderEmalId, workingAs: authUser.workingAs,
      isVendor: authUser.isVendor,
      profilePic: authUser.profilePic
    }
  }
  return responseObject
}

const appointment = asyncHandler(async (req, res) => {
  const loginUser = req.user;
  console.log("login user if" + loginUser._id)

  const { serviceProviderId, service, time, userStreet, userCity, userState, userPostalCode, userCountry, appointmentDate } = req.body;

  const serv = await ServiceProvider.findOne({ _id: serviceProviderId });

  console.log("serviceprovide_id" + serv.phoneNo)
  const newAppointment = new Appointment({
    serviceProvider: serv._id,
    serviderProviderName: serv.serviceProviderName,
    mobile: serv.phoneNo,
    service: service,
    userId: loginUser._id,
    userName: loginUser.name,
    userAddress: {
      street: userStreet,
      city: userCity,
      state: userState,
      postalCode: userPostalCode,
      country: userCountry,
    },
    appointmentDate,
    time,
  });

  const appointment = await newAppointment.save();
  if (appointment) {
    res.status(200).json({ data: appointment });
  }
  else {
    res.status(500).json({ mesaage: "appointmemt not booked" });
  }
});


const fetchAppointment = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  console.log(userId)
  const appointments = await Appointment.find({
    $or: [{ userId: userId },
    { serviceProvider: userId }],

  })
    .populate("serviceProvider")
    .populate("userId", "-password")
    .populate("service")
    .exec();

  res.status(200).json({ data: appointments });
})

const addAddress = asyncHandler(async (req, res) => {
  console.log(req.user._id);
  try {
    const { street, city, state, postalCode, country } = req.body;
    if (!street || !city || !state || !postalCode || !country) {
      res.status(400);
      throw new Error('Please provide all the required information.');
    }

    const location = await Location.create({
      address: {
        street,
        city,
        state,
        postalCode,
        country
      }
    });

    if (location) {
      const loginUserId = req.user.email;
      if (loginUserId) {


        const UserDetail = await User.findOne({ email: loginUserId });

        if (UserDetail.isVendor === false) {

          UserDetail.address.push(location._id)
          console.log("userDetails" + UserDetail)
          await UserDetail.save();
          res.status(200).json({ message: "address added to user" });
        }


        const serviceProvider = await ServiceProvider.findOne({ serviceProviderEmalId: loginUserId });
        console.log(serviceProvider.serviceProviderEmalId == loginUserId)
        if (serviceProvider.isVendor === true) {
          serviceProvider.location.push(location._id)

          await serviceProvider.save();
          res.status(200).json({ message: "Service provider adrees added" });
          console.log("Service provider adrees added");
        } else {
          console.log("Service provider not found");
        }

      }
    }
  } catch (error) {
    // Handle the error appropriately
    console.error('error in address creation:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = { register, loginUser, appointment, fetchAppointment, addAddress, getLoggedInUserResponseObject };
