const { cloudinary } = require("../config/cloudinary");

const createResponse = (data, message, error = false) => {
    if (error) {
        return {
            success: false,
            message: message || 'An error occurred',
            error: data || null,
        };
    } else {
        return {
            success: true,
            message: message || 'Operation successful',
            responseData: data || null,
        };
    }
}

const uploadImageToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { resource_type: 'auto', folder: 'service-mate' },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        ).end(file.buffer);
    });
}

module.exports = { createResponse, uploadImageToCloudinary }
