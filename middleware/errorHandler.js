const errorHandler = (error,req,res)=>{
    error.statusCode =error.statusCode ||500;
    error.status = error.status || "Error Found" 
res.status(error.statusCode).json({
    staus:error.statusCode,
    message: error.message,
})
console.log(error.status)
}

module.exports = errorHandler;