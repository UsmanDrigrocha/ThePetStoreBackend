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

    const { name, image } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Enter Name of Category !!!" });
    }
    if (!image) {
      return res.status(400).json({ message: "Enter Image of Category !!!" });
    }

    const categoryData = new Category({
      name: name,
      image: image,
    });

    if (req.body.parentId) {
      const parentId = new mongoose.Types.ObjectId(req.body.parentId); // Convert string to ObjectID
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
  }
  catch (error) {
    console.log(error.message)
    res.status(400).json({ message: "Error Creating Category" });
  }
};

const readOneCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Enter ID" });
    }
    const objId = new mongoose.Types.ObjectId(id);
    const data = await Category.findOne({ _id: objId }); // Change "id" to "_id"

    if (!data) {
      res.status(404).json({ message: "Not Found" }); // Change status code to 404 for "Not Found"
    } else {
      res.status(200).json({ message: "Category Found", data: data }); // Change status code to 200 for "OK"
    }
  } catch (error) {
    res.status(500).json({ message: "Error Getting Category !!!!", error: error.message }); // Change status code to 500 for "Internal Server Error"
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image, parentId } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Enter ID" });
    }

    const objId = new mongoose.Types.ObjectId(id);
    const existingCategory = await Category.findById(objId);

    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    const currentDate = new Date();
    console.log(currentDate);

    // Check if the fields are provided and update only if they exist in the request
    if (name) {
      existingCategory.name = name;
    }
    if (image) {
      existingCategory.image = image;
    }
    if (parentId) {
      existingCategory.parentId = parentId;
    }

    const updatedCategory = await existingCategory.save();
    res.status(200).json({ message: "Category updated", data: updatedCategory });
  } catch (error) {
    res.status(500).json({ message: "Error updating category", error: error.message });
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



// Controller Function ----- Upload Banner
const imageController = async (req, res, next) => {
  try {
    const { fileURL } = req.body;
    const newBanner = new bannerModel({
      image: fileURL
    })

    await newBanner.save()
    res.json({ message: "Banner Created Successfully", fileURL });
  } catch (error) {
    res.status(400).json({ message: "Error Testing Img Upload" });
  }
};

const getChildCategories = async (req, res) => {
  try {
    const { id } = req.params;
    const findChildCategory = await Category.find({ parentId: id });
    if (!findChildCategory) {
      return res.status(200).json({ message: "Invalid ID / Not Exist" })
    }
    res.status(200).json({ message: "Getting Child Categories", child: findChildCategory });
  } catch (error) {
    res.status(400).json({ message: "Error Getting Child Categories" })
  }
}


module.exports = {
  imageController,
  showRegistedUsers,
  showBannerImg,
  createCategory,
  getProductCategories,
  readOneCategory,
  updateCategory,
  getChildCategories
};