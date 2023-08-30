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
  location:[{
    type:mongoose.Schema.Types.ObjectId,
    ref : "Location"
       }],
  profile: {
    photo: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "not active"],
      required: true,
    },
  },
});
const employee = mongoose.model("employee", employeeSchema);
module.exports = employee;
