const multer = require('multer');
const storage = multer.memoryStorage(); // Store image data in memory
const upload = multer({ storage: storage });
const bannerModel = require('../models/bannerModel'); //banner model
const mongoose = require('mongoose'); 
require('dotenv').config();
const path = require('path')
const userModel = require('../models/userModel');
const {
  Category,
  Product,
} = require('../models/productModel');


const jwt = require('jsonwebtoken');

const showRegistedUsers = async (req, res) => {
  try {
    try {
      const data = await userModel.find({})
      res.status(200).json(data);
    } catch (error) {
      console.log(error)
      res.status(400).json({ message: "Error Getting Data from DB", error: error.message })
    }
  } catch (error) {
    console.error('Error retrieving Users:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const showBannerImg = async (req, res) => {
  try {
    const data = await bannerModel.find({});

    //---- Display the data
    // data.forEach(item => {
    //     // You can access other fields here as well
    // });

    // Respond with the data in an HTTP response
    res.status(200).json(data);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


const createCategory = async (req, res) => {
  try {
    // Handle file upload
    uplod.single('image')(req, res, async (err) => {
      if (!req?.file) {
        return res.status(400).json({ message: "Enter Image" });
      }
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Enter Name of Category !!!" });
      }

      const fileType = req.file.mimetype;
      const fileName = req.file.filename;
      // Construct the complete URL
      const fileURL = `${fileName}`;

      const categoryData = new Category({
        name: name,
        image: fileURL,
      });

      if (req.body.parentId) {
        const parentId =new mongoose.Types.ObjectId(req.body.parentId); // Convert string to ObjectID
        const findCategory = await Category.findOne({ _id: parentId });

        if (findCategory) {
          categoryData.parentId = parentId;
        } else {
          return res.status(400).json({ message: "No Such parentId Exist" });
        }
      }



      // Save to the database
      await categoryData.save();
      res.json({ message: "Category Created Successfully", categoryData });
    });
  } catch (error) {
    res.status(400).json({ message: "Error Testing Img Upload" });
  }
};




const getProductCategories = async (req, res) => {
  try {
    const data = await Category.find({});
    res.status(200).json(data);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ message: 'Error Getting Product Categories', error: error.message });
  }
};


//################### Image Controller Logic -- Create;  ----- Upload Banner
const port = process.env.PORT;
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg'];
const imageFilter = (req, file, cb) => {
  if (allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only specific image file types (JPEG, PNG, GIF, SVG) are allowed!'), false);
  }
};
const store = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
  }
});
const uplod = multer({ storage: store, fileFilter: imageFilter });
// Controller Function ----- Upload Banner
const imageController = async (req, res, next) => {
  try {
    uplod.single('image')(req, res, (err) => {
      if (!req?.file) {
        return res.status(200).json({ message: "Enter Image" });
      }
      if (err) {
        return res.status(400).json({ message: err.message });
      }


      const fileType = req.file.mimetype;
      const fileName = req.file.filename;
      // Construct the complete URL
      const fileURL = `${fileName}`;
      const newBanner = new bannerModel({
        image: fileURL
      })
      const saveToDb = async () => {
        await newBanner.save()
      }
      saveToDb() // calling it 
      res.json({ message: "File Uploaded Successfully", fileURL });
    });
  } catch (error) {
    res.status(400).json({ message: "Error Testing Img Upload" });
  }
};



module.exports = {
  imageController,
  showRegistedUsers,
  showBannerImg,
  createCategory,
  getProductCategories,
};