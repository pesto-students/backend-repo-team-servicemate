const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../config/generateToken');
const ServiceProvider = require('../models/serviceProvideModel');
const Appointment = require('../models/appointmentBookingModel ');
const Location = require('../models/locationModel');
const { createResponse, handleError } = require('../utils');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

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
    throw new Error('please enter details correctly login');
  }
  let authUser;
  authUser = await ServiceProvider.findOne({ serviceProviderEmailId: email }).populate({ path: 'location', model: 'Location' });
  if (!authUser) {
    authUser = await User.findOne({ email }).populate({
      path: 'address',
      model: 'Location'
    });
  }
  const userPassword = await User.findOne({ email }).select('password');
  if (authUser && (await userPassword.passwordMatch(password))) {
    const { isVendor } = authUser;
    res.status(200).json(getLoggedInUserResponseObject(authUser, isVendor, true));
  } else {
    res.send(400).json(createResponse({ error: 'Either email id or password doesn\'t match' }));
  }
});

const getLoggedInUserResponseObject = (authUser, isVendor, isTokenRequired) => {
  let responseObject = {
    _id: authUser._id,
    name: authUser.name,
    email: authUser.email,
    phoneNo: authUser.phoneNo,
    address: authUser.addresses
  };

  if (isTokenRequired) {
    responseObject.token = generateToken(authUser._id);
  }

  if (isVendor) {
    responseObject = {
      ...responseObject, name: authUser.serviceProviderName, email: authUser.serviceProviderEmailId, workingAs: authUser.workingAs,
      isVendor: authUser.isVendor,
      profilePic: authUser.profilePic,
      establishedDate: authUser.establishedDate
    };
  }
  return responseObject;
};

const bookAppointment = asyncHandler(async (req, res) => {
  const loginUser = req.user;
  console.log('login user if' + loginUser?._id);

  const { service, time, userStreet, userCity, userState, userPostalCode, userCountry, appointmentDate, vendorId, userEmailId, userName } = req.body;

  const serv = await ServiceProvider.findOne({ _id: vendorId });

  console.log('serviceprovide_id' + serv.phoneNo);
  const newAppointment = new Appointment({
    serviceProviderId: serv._id,
    serviceProviderName: serv.serviceProviderName,
    mobile: serv.phoneNo,
    service: service,
    // userId: loginUser?._id,
    userName: loginUser?.name || userName,
    userAddress: {
      street: userStreet,
      city: userCity,
      state: userState,
      postalCode: userPostalCode,
      country: userCountry,
    },
    appointmentDate,
    time,
    userEmailId: userEmailId,
  });

  const appointment = await newAppointment.save();
  if (appointment) {
    res.status(200).json({ data: appointment });
  }
  else {
    res.status(500).json({ message: 'appointmemt not booked' });
  }
});


const fetchAppointment = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const filter = {
      [req.query.v ? 'serviceProviderId' : 'userId']: userId
    };
    const appointments = await Appointment.find(filter)
      .populate('serviceProviderId')
      .populate('userId', '-password')
      .populate('service')
      .exec();
    res.json(createResponse(appointments));
  } catch (err) {
    handleError(err, res);
  }
});

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

          UserDetail.address.push(location._id);
          console.log('userDetails' + UserDetail);
          await UserDetail.save();
          res.status(200).json({ message: 'address added to user' });
        }


        const serviceProvider = await ServiceProvider.findOne({ serviceProviderEmailId: loginUserId });
        console.log(serviceProvider.serviceProviderEmailId == loginUserId);
        if (serviceProvider.isVendor === true) {
          serviceProvider.location.push(location._id);

          await serviceProvider.save();
          res.status(200).json({ message: 'Service provider adrees added' });
          console.log('Service provider adrees added');
        } else {
          console.log('Service provider not found');
        }

      }
    }
  } catch (error) {
    // Handle the error appropriately
    console.error('error in address creation:', error);
    res.status(500).json({ error: error.message });
  }
});
const updatePassword = asyncHandler(async (req, res) => {


  const { email, newPassword } = req.body;

  try {
    // Check if a user with the provided email exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

const sendEmail = async (res, req) => {
  const { email } = req.body;

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'claire39@ethereal.email',
      pass: 'Q9jh58Mx8ZMV44zCwQ'
    }
  });

  let info = await transporter.sendMail({
    from: '"arpit4499 👻" <arpit4499@gmail.com>', // sender address
    to: email, // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world?', // plain text body
    html: '<b>Hello world?</b>', // html body
  });
  console.log('Message sent: %s', info.messageId);
  res.json(info);
};

const updateAppointments = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { v } = req.query;
  const { status, appointmentDate, time, _id } = req.body;
  try {
    const payload = { status };
    if (status === 'reschedule') {
      payload.appointmentDate = appointmentDate;
      payload.time = time;
    }
    const appointments = await Appointment.findOneAndUpdate({
      $and: [{ [v ? 'serviceProviderId' : 'userId']: userId }, { id: _id }, { status: { $ne: status } }]
    }, payload, { new: true });
    res.json(createResponse(appointments));
  } catch (error) {
    handleError(error, res);
  }
});

module.exports = { register, loginUser, bookAppointment, fetchAppointment, addAddress, getLoggedInUserResponseObject, updatePassword, sendEmail, updateAppointments };
