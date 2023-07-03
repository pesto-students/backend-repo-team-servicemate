const errorHandler = (err,req,res,next)=>{
    err.statusCode =err.statusCode ||500;
    err.status = err.status || "Error Found" 
res.status(err.statusCode).json({
    staus:err.statusCode,
    message: err.message,
})
}

module.exports = errorHandler();