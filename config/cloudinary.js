const { v2 } = require('cloudinary');
const multer = require('multer');

v2.config({
    cloud_name: 'dkf5damli',
    api_key: '852329217994366',
    api_secret: process.env.CLOUDINARY || '4flIJXXP7UWFjbOdLLwxogRVDhI'
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = { cloudinary: v2, upload };