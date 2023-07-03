const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  id_proof: {
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
      required: true,
    },
    status: {
      type: String,
      enum: ["completed", "not completed"],
      required: true,
    },
  },
});
const employee = mongoose.model("employee", employeeSchema);
module.exports = employee;
