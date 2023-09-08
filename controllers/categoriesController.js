const expressAsyncHandler = require("express-async-handler")
const Category = require("../models/catagoriesModel")
const { cloudinary } = require("../config/cloudinary")

const getTopCategories = expressAsyncHandler(async (req, res) => {
    const data = (await Category.find()).map(data => data.toObject())
    res.json(data && data.length ? data.filter(cat => cat.name) : [])
})

const addCategory = expressAsyncHandler(async (req, res) => {
    const { name } = req.body
    const file = req.file;
    if (!file) {
        return res.status(400).json({ message: 'Please upload an image' });
    }
    try {
        uploadImage(file, async (err, result) => {
            if (err) {
                throw new Error(err)
            } else {
                const newData = new Category({
                    name,
                    image: result.secure_url,
                    value: typeof name === 'string' && name.toLowerCase(),
                });
                const response = await newData.save();
                console.log(response.toJSON());
                res.status(201).json({ message: 'Data and image uploaded successfully', data: response.toJSON() });
            }
        })
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Server error' });
    }
})

const uploadImage = async (file, callback) => {
    return cloudinary.uploader.upload_stream({ resource_type: 'auto', folder: 'service-mate' }, callback).end(file.buffer);
}

const updateCategory = expressAsyncHandler(async (req, res) => {
    const { name, id, image } = req.body
    const file = req.file;
    if (!image && !file) {
        return res.status(400).json({ message: 'Please upload an image' });
    }
    try {
        const payload = {}
        const categoryData = await Category.findById(id)
        if (name !== categoryData.toObject().name) {
            payload.name = name
        }
        if (file) {
            uploadImage(file, async (err, result) => {
                payload.image = result.secure_url
                const responseFromUpdate = await categoryData.updateOne(payload)
                res.json({ message: "Data updated successfully", data: responseFromUpdate })
            })
        }
        else if (Object.keys(payload).length) {
            const responseFromUpdate = await categoryData.updateOne(payload)
            res.json({ message: "Data updated successfully", data: responseFromUpdate })
        }
    }
    catch (error) {
        res.status(500).json({ message: error })
    }
})

const deleteCategory = expressAsyncHandler(async (req, res) => {
    const { id } = req.params
    try {
        const response = await Category.findByIdAndDelete(id)
        console.log("🚀 ~ file: categoriesController.js:49 ~ deleteCategory ~ response:", response)
        res.json({ message: "Delete successfully: " + id })
    }
    catch (error) {
        res.status(500).json({ message: error })
    }
})

module.exports = { getTopCategories, addCategory, updateCategory, deleteCategory }