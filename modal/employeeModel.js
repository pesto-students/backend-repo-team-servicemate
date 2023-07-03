const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
    idProofType: {
        type: String,
        required: true,
      },    
  idProof: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  profile: {
    photo: {
      type: String,  
    },
  }
});
const EmployeeData = mongoose.model("EmployeeData", employeeSchema);
module.exports = EmployeeData;