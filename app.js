const express = require('express');
const env = require('dotenv');
const { PageNotFound, BadReq, ReqError } = require('./middleware/errors');
const dbConnect = require('./config/dbConnect');
const errorHandler = require('./middleware/errorHandler');
const vendorRouter = require('./Routes/vendorRouter');
const userRouter = require('./Routes/userRouter')
const cors = require('cors');

const app = express();

app.use(cors())
app.use(express.json());

env.config();
//dataBase connection
dbConnect();

// if (process.env.NODE_ENV !== 'production') {
//     env.config()
// }

app.get('/', (req, res) => {
    res.send(req.httpVersion)
});

//error and errorHandler section


app.use('/api/vendor', vendorRouter);
app.use('/api/user', userRouter);

app.all(ReqError);
app.all(BadReq);
app.all("*", PageNotFound)
app.use(errorHandler)


const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`server started on ${PORT}`));
