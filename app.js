const express = require('express');
const env = require('dotenv');
const { PageNotFound, BadReq, ReqError } = require('./middleware/errors');
const dbConnect = require('./config/dbConnect');
const errorHandler = require('./middleware/errorHandler');
const vendorRouter = require('./routes/vendorRouter');
const userRouter = require('./routes/userRouter');

const categoriesRoutes = require('./routes/categoriesRoutes');

const cors = require('cors');
const expressAsyncHandler = require('express-async-handler');
const { createResponse } = require('./utils');


const app = express();

app.use(cors());
app.use(express.json());

env.config();
//dataBase connection
dbConnect();

// if (process.env.NODE_ENV !== 'production') {
//     env.config()
// }

app.get('/', (req, res) => {
    res.send(req.httpVersion);
});

app.get('/api/getLocation/:lat/:lon', async (req, res) => {
    const { lat, lon } = req.params;
    const { by } = req.query;
    try {
        const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        const responseData = data.address && by ? { [by]: data.address[by] } : data.address;
        res.json(responseData);
    } catch (error) {
        console.log(error);
        res.json({});
    }
});

app.get('/api/location', expressAsyncHandler(async (req, res) => {
    const { q, lat, lon } = req.query;
    let apiUrl;
    if (q) {
        apiUrl = `https://api.geoapify.com/v1/geocode/autocomplete?text=${q}&apiKey=${process.env.GEOAPIFY}`;
    } else if (lat && lon) {
        apiUrl = `https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}`;
    }
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.json(createResponse(data?.features?.map(f => f.properties) || []));
}));

//error and errorHandler section


app.use('/api/vendor', vendorRouter);
app.use('/api/user', userRouter);
app.use('/api/categories', categoriesRoutes);

app.all(ReqError);
app.all(BadReq);
app.all('*', PageNotFound);
app.use(errorHandler);


const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`server started on ${PORT}`));
