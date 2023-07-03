const mongoose = require("mongoose");
const env = require('dotenv');
const { Uri } = require(".");
env.config();
const dbConnect = async () => {
  try {
    const con = await mongoose.connect(Uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,


    })
    console.log(`connection establised :{${con.connection.host}} `)
  } catch (error) {
    console.log(`Error : ${error.message}`);
    // process.exit();

  }
}

module.exports = dbConnect;