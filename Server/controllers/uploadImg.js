const multer = require('multer');
const bannerModel = require('../models/bannerModel')
const storage = multer.memoryStorage(); // Store image data in memory
const upload = multer({ storage: storage });


// ---------------------------------
const imageController = async (req, res) => {
  try {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', /* Add more types as needed */];

    const imageFilter = (req, file, cb) => {
      if (allowedImageTypes.includes(file.mimetype)) {
        // Accept only specific image MIME types in the 'allowedImageTypes' array
        cb(null, true);
      } else {
        cb(new Error('Only specific image file types (JPEG, PNG, GIF, etc.) are allowed!'), false);
      }
    };

    const upload = multer({ storage: storage, fileFilter: imageFilter });

    upload.single('image')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      // Process the uploaded image data
      const imageBuffer = req.file.buffer;
      const contentType = req.file.mimetype;
      const { name, description } = req.body;

      // Save the image to the database
      const image = new bannerModel({
        data: imageBuffer,
        contentType: contentType,
        name: name,
        description: description,
      });

      await image.save();

      res.status(200).json({ message: "Image saved to DataBase" });
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


module.exports = {
  imageController,
};
