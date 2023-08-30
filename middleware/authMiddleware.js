const jwt = require("jsonwebtoken")
const asyncHandler = require('express-async-handler');
const User = require("../models/userModel");
const protect = asyncHandler(async(req,res,next)=>{
    const JWT_SECRET = 'arpit';
    let token;
    
    if ((req.headers.authorization) &&
    req.headers.authorization.startsWith('Bearer')
    ){
    token = req.headers.authorization.split(" ")[1];
    try {
        ///decode
        const decode = jwt.verify(token,JWT_SECRET);
        req.user = await User.findById(decode.id).select('-password');
        next();
        
     } catch (error) {
         res.status(401);
         throw new Error("not authorize,token fails")
     }
    }
 
    if (!token){
        res.status(401);
        throw new Error("not authorize,no token")
    }
})
module.exports = {protect};