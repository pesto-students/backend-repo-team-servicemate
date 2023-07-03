const express = require('express');
const env = require('dotenv');
const app = express();
const config = require("./config");
const { PageNotFound, BadReq, ReqError } = require('./middleware/errors');
const dbConnect = require('./config/dbConnect');
const secrets = require('./config/aws-env');
env.config();
//dataBase connection
dbConnect();

if (process.env.NODE_ENV !== 'production') {
    env.config()
}

app.get('/', (req, res) => {
    res.send(req.httpVersion)
});

//error and errorHandler section
app.all(ReqError);
app.all(BadReq);
app.all("*", PageNotFound)
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error found"
    res.status(err.statusCode).json({
        staus: err.statusCode,
        message: err.message,
    })
})

console.log(secrets)


const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`server started on ${PORT}`));
