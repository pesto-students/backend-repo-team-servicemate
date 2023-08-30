const mongoose = require("mongoose");
const env = require('dotenv');
const secretData = require(".");


env.config();
const dbConnect = async()=>{
  const secretValu = await secretData();
  console.log(secretValu);
  if (!secretValu) {
    console.log('MongoDB URI not found in AWS Secret Manager');
    return;
}
//const MONGO_URI='mongodb+srv://arpit4499:Yrcfy4yLkodQwpXY@cluster0.mt4a4fw.mongodb.net/?retryWrites=true&w=majority'

    try {
      const con = await mongoose.connect(secretValu, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        
      
         })
    console.log(`connection establised :{${con.connection.host}} `)
    } catch (error) {
        console.log(`Error : ${error.message}`);
        
        
    }
}

module.exports = dbConnect;