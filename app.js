const express = require('express');
const path = require("path")
const env = require('dotenv');
const { PageNotFound, BadReq, ReqError } = require('./middleware/errors');
const dbConnect = require('./config/dbConnect');
const errorHandler = require('./middleware/errorHandler');
const vendorRouter = require('./routes/vendorRouter');
const userRouter = require('./routes/userRouter');

const categoriesRoutes = require("./routes/categoriesRoutes");

const cors = require('cors');


const app = express();

const buildPath = path.join(__dirname, 'build')
app.use(express.static(buildPath))

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

app.get("/api/getLocation/:lat/:lon", async (req, res) => {
    const { lat, lon } = req.params
    const { by } = req.query
    try {
        const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
        const response = await fetch(apiUrl);
        const data = await response.json();
        const responseData = data.address && by ? { [by]: data.address[by] } : data.address
        res.json(responseData);
    } catch (error) {
        console.log(error);
        res.json({})
    }
})

//error and errorHandler section


app.use('/api/vendor', vendorRouter);
app.use('/api/user', userRouter);
app.use('/api/categories', categoriesRoutes)

app.all(ReqError);
app.all(BadReq);
app.all("*", PageNotFound)
app.use(errorHandler)


const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`server started on ${PORT}`));
