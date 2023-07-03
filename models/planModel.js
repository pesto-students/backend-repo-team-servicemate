const mongoose = require('mongoose');
const planSchema = mongoose.Schema({

    userId : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    name_of_Plan :{
        type:String,
    },

    servicesOpted : [{name_of_Plan }],

    assignedTo : [{type:mongoose.Schema.Types.ObjectId,
                    ref:"Employee"}],
      
    discountCode :     {
        type:String,
    },            
   
    status : {
         type:String,
         enum:['customer','vendor'],
         default: ' ',
    },

    amountDue :{
        type: Number,
        required: true,
        integer: true
    },
    amountPaid :{
        type: Number,
        required: true,
        integer: true
    }

})

const Plan = mongoose.Model("plan",planSchema);
module.exports = Plan;