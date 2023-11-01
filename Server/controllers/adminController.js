const jwt = require('jsonwebtoken');
const multer = require('multer');
const storage = multer.memoryStorage(); // Store image data in memory
const upload = multer({ storage: storage });
const bannerModel = require('../models/Admin/bannerModel');
const mongoose = require('mongoose');
require('dotenv').config();
const path = require('path')
const userModel = require('../models/User/userModel');
const {
  Category,
  Product,
} = require('../models/Admin/productModel');

//  ✅
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

//  ✅
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

//  ✅
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

    await categoryData.save();
    res.json({ message: "Category Created Successfully", categoryData });
  }
  catch (error) {
    console.log(error.message)
    res.status(400).json({ message: "Error Creating Category" });
  }
};

//  ✅
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

//  ✅
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

//  ✅
const getProductCategories = async (req, res) => {
  try {
    const data = await Category.find({});
    res.status(200).json(data);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ message: 'Error Getting Product Categories', error: error.message });
  }
};

//  ✅
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

//  ✅
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
//  ✅
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Enter ID" });
    }

    const objId = new mongoose.Types.ObjectId(id);
    const existingCategory = await Category.findOneAndDelete(objId);

    res.status(200).json({ message: "Category Deleted", data: existingCategory });
  } catch (error) {
    res.status(500).json({ message: "Error updating category", error: error.message });
  }
};

//  ✅
const createProduct = async (req, res) => {
  try {
    const { name, price, description, size, quantity, animal, parentId, coupon, images } = req.body;
    if (!name || !price || !description || !size || !quantity || !parentId || !animal || !images) {
      return res.status(400).json({ message: "Enter all Fields" })
    } else {
      const objId = new mongoose.Types.ObjectId(parentId);
      const existingCategory = await Category.findById(objId);
      if (!existingCategory) {
        return res.status(400).json({ message: "No Such Parent Exist" });
      }
      const newProduct = new Product({
        name,
        price,
        description,
        quantity,
        animal,
        size,
        parentId,
        images
      })
      if (coupon) {
        newProduct.coupon = coupon;
      }
      await newProduct.save();
      res.status(201).json({ message: "Product Created !", Product: newProduct })
    }
  } catch (error) {
    console.log(error.message)
    res.status(400).json({ message: "Error creating Product" });
  }
}

//  ✅
const getAllProducts = async (req, res) => {
  try {
    const data = await Product.find({})
    res.status(200).json({ message: "Products Found", Products: data })
  } catch (error) {
    res.status(400).json({ message: "Error Getting All Products" })
  }
}

//  ✅
const getProductsByCategories = async (req, res) => {
  try {
    const { id } = req.params;
    const findProducts = await Product.find({ parentId: id });
    if (!findProducts) {
      return res.status(200).json({ message: "Invalid ID / Not Exist" })
    }
    res.status(200).json({ message: "Getting Products by Categories", products: findProducts });
  } catch (error) {
    res.status(400).json({ message: "Error Getting Products by categories" })
  }
}

//  ✅
const getOneProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const findProduct = await Product.findOne({ _id: id });
    if (!findProduct) {
      return res.status(400).json({ message: "Product Not Found" })
    }
    res.status(200).json({ message: "Product Found", findProduct })
  } catch (error) {
    res.status(400).json({ message: "Error Getting Product" })

  }
}

//  ✅
const UpdateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, size, quantity, animal, parentId, coupon, images } = req.body;
    const findProduct = await Product.findOne({ _id: id });
    if (!findProduct) {
      return res.status(400).json({ message: "Product Not Found" })
    }
    if (name) {
      findProduct.name = name;
    }
    if (price) {
      findProduct.price = price;
    }
    if (description) {
      findProduct.description = description;
    }
    if (size) {
      findProduct.size = size;
    }
    if (quantity) {
      findProduct.quantity = quantity;
    }
    if (animal) {
      findProduct.animal = animal;
    }
    if (parentId) {
      findProduct.parentId = parentId;
    }
    if (coupon) {
      findProduct.coupon = coupon;
    }
    if (images) {
      findProduct.images = images;
    }
    await findProduct.save();
    res.status(200).json({ message: "Product Updated", findProduct })
  } catch (error) {
    res.status(400).json({ message: "Error Getting Product" })
  }
}

//  ✅
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const findProduct = await Product.findOneAndDelete({ _id: id });
    if (!findProduct) {
      return res.status(400).json({ message: "Product Not Found" })
    }
    res.status(200).json({ message: "Deleted Product", findProduct })
  } catch (error) {
    res.status(400).json({ message: "Error Deleting Product" })
  }
}

//  ✅
const createSale = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Enter ID" });
    }
    const findProduct = await Product.findOne({ _id: id });
    if (!findProduct) {
      return res.status(400).json({ message: "Product Not Found !!!" });
    }
    const { discountPercentage , expirationDate} = req.body;
    if (!discountPercentage) {
      return res.status(400).json({ message: "Enter Discount Percentage !!" });
    }
    var discount = (findProduct.price * discountPercentage) / 100;
    var discountedPrice = findProduct.price - discount;
    findProduct.discountPercentage.discountPercentage = discountPercentage;
    findProduct.discountPercentage.discountedPrice = discountedPrice;

    console.log(discountedPrice)
    res.status(200).json({ message: "Creating Sale !!" });
  } catch (error) {
    console.log(error.message)
    res.status(400).json({ message: "Error Creating Sale" });
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
  getChildCategories,
  deleteCategory,
  createProduct,
  getAllProducts,
  getProductsByCategories,
  getOneProduct,
  UpdateProduct,
  deleteProduct,
  createSale,

};