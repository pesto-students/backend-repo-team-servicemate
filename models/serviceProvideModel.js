const mongoose = require("mongoose");
const serviceProviderModal = mongoose.Schema({
    serviceProviderName :{
          type:String,
          trim : true,
          required:true
         },
       
         profilePic: {
          type: String,
          
        },
         serviceProviderEmalId:{
            type:String,
            trim : true,
            required : true
         },
         userType: {
          type: Boolean,
          default: false
        },
         phoneNo:{
          type:Number,
          required : true
         },
         workingAs:{
            type: String,
            enum: ['freelancer', 'vendor','vendorEmployee']
         },
         employeeData:[{
             type:mongoose.Schema.Types.ObjectId,
             ref:"ServiceProvider"
         }],
         service:[{
          type:mongoose.Schema.Types.ObjectId,
          ref:"Services"
         }],
         location:[{
          type:mongoose.Schema.Types.ObjectId,
          ref : "Location"
             }],
         openHours: [{
                
                    timeSlot:[{
                      day: [{
                        type: String,
                        required: true
                      }],
                      fromTime: {
                        type: String,
                        required: true
                      },
                      toTime: {
                        type: String,
                        required: true
                      }
                    }]    
         }],
         portfolio:[{
              image:{
                type:String,
              
              },
              verified:{
                type:Boolean,
              }
            }],
          createdOn: {
            type: Date,
            default: Date.now
          },
          updatedOn: {
            type:Date
          },
          rating  : {
            type:Number,
          },
          memberShip:[{
            name:{
                type:String
            },
            expireOn:{
                type:Date,
                required:true
            },
            activatedOn:{
                type:Date,
                required:true
            },
            status:{
                type:String,
                enum:["active","not active"]
            }

          }]

});

const ServiceProvider = mongoose.model("ServiceProvider",serviceProviderModal);
module.exports = ServiceProvider;
