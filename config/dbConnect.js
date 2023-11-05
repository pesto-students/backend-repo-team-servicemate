const mongoose = require('mongoose');
const env = require('dotenv');


env.config();
const dbConnect = async () => {
  const mongoUri = process.env.MONGO_URI;
  console.log(mongoUri);
  if (!mongoUri) {
    console.log('Could not connect to MongoDB');
    return;
  }
  try {
    const con = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`connection establised :{${con.connection.host}} `);
  } catch (error) {
    console.log(`Error : ${error.message}`);
  }
};

module.exports = dbConnect;