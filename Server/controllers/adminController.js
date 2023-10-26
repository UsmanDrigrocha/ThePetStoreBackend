const multer = require('multer');
const storage = multer.memoryStorage(); // Store image data in memory
const upload = multer({ storage: storage });
const bannerModel = require('../models/bannerModel'); //banner model
require('dotenv').config();
const path = require('path')
const userModel = require('../models/userModel');
const {
  Category,
  SubCategory,
  childSubCategory,
  Product,
} = require('../models/productModel');


const jwt = require('jsonwebtoken');

const showRegistedUsers = async (req, res) => {
  try {
    try {
      const data = await userModel.find({})
      console.log(data)
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

//
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ message: "Enter Category Name" });
    } else {
      const newCategory = new Category({
        name
      });
      await newCategory.save();
      res.status(200).json({ message: "Catagory Created", newCategory });
    }
  } catch (error) {
    res.status(400).json({ message: "Error in Creating Category", error: error.message })
  }
}



const createSubCategory = async (req, res) => {
  try {
    const { name, parentCategory } = req.body; // Assuming you also send the parent category ID
    if (!name || !parentCategory) {
      res.status(400).json({ message: "Enter All Fields" });
    } else {
      const newSubCategory = new SubCategory({
        name,
        parentCategory: parentCategory, // Assign the parent category ID
      });
      await newSubCategory.save();

      // Push the new subcategory's ID to the parent category's childSubCategories
      const parentCategoryDoc = await Category.findOneAndUpdate(
        { _id: parentCategory },
        { $push: { childSubCategories: newSubCategory._id } },
        { new: true }
      );

      res.status(200).json({ message: "Subcategory Created", newSubCategory, parentCategory: parentCategoryDoc });
    }
  } catch (error) {
    res.status(400).json({ message: "Error in Creating Subcategory", error: error.message });
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


//################### Image Controller Logic -- Create; 
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
// Controller Function
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
      console.log(newBanner)
      res.json({ message: "Working", fileURL });
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
  createSubCategory
};