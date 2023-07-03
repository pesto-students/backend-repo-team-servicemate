const PageNotFound = (req,res,next)=>{
    const error = new Error(`cant find ${req.originalUrl} on the server`)
    error.statusCode= 404;
    error.staus="fail";
    next(error);
}


  const BadReq = (req, res, next) => {
    if (!req.body || !req.body.name) {
      const error = new Error('Invalid request');
      error.statusCode = 400;
      error.staus = 'Bad Request';
      next(error);
    } else {
      next();
    }
}


  const ReqError = ()=> {
    if (req.headers.expect === 'something') {
      const error = new Error('Expectation Failed');
      error.statusCode = 417;
      error.staus = 'Request Header Error';
      next(error);
    } else {
      next();
    }

  }

module.exports = {PageNotFound,BadReq,ReqError};