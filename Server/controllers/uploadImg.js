const mongoose = require('mongoose');
const multer = require('multer');
const bannerModel = require('../models/bannerModel')
const storage = multer.memoryStorage(); // Store image data in memory
const upload = multer({ storage: storage });

const imageController = async (req, res) => {
  try {
    upload.single('image')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: "Error Uploading Image" });
      }

      // Process the uploaded image data
      const imageBuffer = req.file.buffer;
      const contentType = req.file.mimetype;
      const { name, description } = req.body

      // Save the image to the database
      const image = new bannerModel({
        data: imageBuffer,
        contentType: contentType,
        name:name,
        description
      });

      await image.save();

      res.status(200).json({ message: "Upload and save working" });
    });
  } catch (error) {
    res.status(400).json({ message: "Error Uploading and Saving Image" });
  }
};

module.exports = {
  imageController,
};