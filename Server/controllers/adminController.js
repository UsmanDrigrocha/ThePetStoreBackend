const multer = require('multer');
const storage = multer.memoryStorage(); // Store image data in memory
const upload = multer({ storage: storage });
const bannerModel = require('../models/bannerModel');
const registedUsersModel = require('../models/userModel');
const {
  Category,
  SubCategory,
  childSubCategory,
  Product,
} = require('../models/productModel');

const jwt = require('jsonwebtoken');

const showRegistedUsers = async (req, res) => {
  try {
    const data = await registedUsersModel.find({});

    res.status(200).json(data);
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


// 
const getProductCategories = async (req, res) => {
  try {
    const data = await Category.find({});
    res.status(200).json(data);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ message: 'Error Getting Product Categories', error: error.message });
  }
};

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
  showRegistedUsers,
  showBannerImg,
  createCategory,
  getProductCategories,
  createSubCategory
};