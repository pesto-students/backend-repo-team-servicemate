const env = require('dotenv');
env.config();
module.exports = {
    port: process.env.PORT,
    Uri : process.env.MONGO_URI
}