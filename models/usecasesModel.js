const mongoose = require("mongoose");

const usecaseSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  usecaseType: {
    type: String,
    enum: ["plumbing", "electrician", "carpenter"],
    required: true,
  },
  
  usecaseSubtype: {
    type: String,
    required: true,
  },
  serviceProviders: [
    {
      serviceProviderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceProvider",
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
});
const usecase = mongoose.model("usecase", usecaseSchema);
module.exports = usecase;
