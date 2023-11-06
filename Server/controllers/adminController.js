const jwt = require('jsonwebtoken');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const bannerModel = require('../models/Admin/bannerModel');
const mongoose = require('mongoose');
require('dotenv').config();
const path = require('path')
const userModel = require('../models/User/userModel');
const { Category, Product } = require('../models/Admin/productModel');
const Offer = require('../models/Admin/offers')
const bcrypt = require('bcrypt');




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

//Login Account + Generate Token ✅
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email });
    if (!email || !password) { // if any field missing
      res.status(400).json({ message: "Some field missing !!!" });
    }
    else {
      if (!user) { // if email doesn't exist in DB
        res.status(401).json({ message: "User Doesn't Exists" });
      } else {
        if (!user.role === 'Super Admin' || !user.role === 'admin') {
          return res.send('Unauthorized to LOGIN');
        }
        const token = jwt.sign({ userID: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: '4d' });
        bcrypt.compare(password, user.password, function (err, result) {
          //Comparing Password
          if (result) { //if password is correct
            req.session.adminToken = token;
            res.status(202).json({ message: "User Logged In successfully", adminToken: token });
          } else { // if wrong password
            res.status(401).json({ message: "Wrong Password" });
          }
        });
      }
    }
  } catch (error) {
    res.status(400).json({ message: "Error while login", error: error.message });
  }
};

//  ✅
const showBannerImg = async (req, res) => {
  try {
    const data = await bannerModel.find({});

    res.status(200).json(data);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

//  ✅
const createCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await userModel.findOne({ _id: id, isDeleted: false });
    if (!admin) {
      return res.status(400).json({ message: "User Not Exist !!!!!!!!" })
    }
    if (!admin.role === 'Super Admin' || !admin.role === 'admin') {
      return res.send('Unauthorized Person');
    }
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

    if (req.body.categoryID) {
      const categoryID = new mongoose.Types.ObjectId(req.body.categoryID); // Convert string to ObjectID
      const findCategory = await Category.findOne({ _id: req.body.categoryID });


      if (findCategory) {
        categoryData.categoryID = categoryID;
      } else {
        return res.status(400).json({ message: "No Such category ID Exist" });
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
    const { name, image, categoryID, adminId } = req.body;
    if (!adminId) {
      return res.status(400).json({ message: "Enter All Fields" })
    }
    const admin = await userModel.findOne({ _id: adminId, isDeleted: false });
    if (!admin) {
      return res.status(400).json({ message: "Admin Not Exist" })
    }
    if (!admin.role === 'Super Admin' || !admin.role === 'admin') {
      return res.send('Unauthorized Person');
    }

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
    if (categoryID) {
      existingCategory.categoryID = categoryID;
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
    const findChildCategory = await Category.find({ categoryID: id });
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
    const { adminId } = req.body;
    if (!adminId) {
      return res.status(400).json({ message: "Enter Admin ID" })
    }
    const admin = await userModel.findOne({ _id: adminId, isDeleted: false });
    if (!admin) {
      return res.status(400).json({ message: "Admin Not Exist" })
    }
    if (!admin.role === 'Super Admin' || !admin.role === 'admin') {
      return res.send('Unauthorized Person');
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
    const { name, price, description, size, quantity, animal, categoryID, coupon, images } = req.body;
    if (!name || !price || !description || !size || !quantity || !categoryID || !animal || !images) {
      return res.status(400).json({ message: "Enter all Fields" })
    } else {
      const objId = new mongoose.Types.ObjectId(categoryID);
      const existingCategory = await Category.findById(objId);
      if (!existingCategory) {
        return res.status(400).json({ message: "No Such Parent Exist" });
      }

      const { adminId } = req.body;
      if (!adminId) {
        return res.status(400).json({ message: "Enter Admin ID" })
      }
      const admin = await userModel.findOne({ _id: adminId, isDeleted: false });
      if (!admin) {
        return res.status(400).json({ message: "Admin Not Exist" })
      }
      if (!admin.role === 'Super Admin' || !admin.role === 'admin') {
        return res.send('Unauthorized Person');
      }
      const newProduct = new Product({
        name,
        price,
        description,
        quantity,
        animal,
        size,
        categoryID,
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
    const products = await Product.find({});

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    for (const product of products) {
      const productId = product._id;
      await updateProductOfferPrice(productId);
    }

    res.status(200).json({ message: "All Products", Products: products });
  } catch (error) {
    console.error("Error updating product offerPrices:", error);
    res.status(400).json({ message: "Error Getting products" });
  }
}


//  ✅
const getProductsByCategories = async (req, res) => {
  try {
    const { id } = req.params;
    const findProducts = await Product.find({ categoryID: id });
    if (!findProducts) {
      return res.status(200).json({ message: "Invalid ID / Not Exist" })
    }
    for (const product of findProducts) {
      const productId = findProducts._id;
      await updateProductOfferPrice(productId);
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
    updateProductOfferPrice(id)
    res.status(200).json({ message: "Product Found", findProduct })
  } catch (error) {
    res.status(400).json({ message: "Error Getting Product" })

  }
}

//  ✅
const UpdateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, size, quantity, animal, categoryID, coupon, images } = req.body;
    const findProduct = await Product.findOne({ _id: id });
    if (!findProduct) {
      return res.status(400).json({ message: "Product Not Found" })
    }
    const { adminId } = req.body;
    if (!adminId) {
      return res.status(400).json({ message: "Enter Admin ID" })
    }
    const admin = await userModel.findOne({ _id: adminId, isDeleted: false });
    if (!admin) {
      return res.status(400).json({ message: "Admin Not Exist" })
    }
    if (!admin.role === 'Super Admin' || !admin.role === 'admin') {
      return res.send('Unauthorized Person');
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
    if (categoryID) {
      findProduct.categoryID = categoryID;
    }
    if (coupon) {
      findProduct.coupon = coupon;
    }
    if (images) {
      findProduct.images = images;
    }
    await updateProductOfferPrice(id);
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
    const { adminId } = req.body;
    if (!adminId) {
      return res.status(400).json({ message: "Enter Admin ID" })
    }
    const admin = await userModel.findOne({ _id: adminId, isDeleted: false });
    if (!admin) {
      return res.status(400).json({ message: "Admin Not Exist" })
    }
    if (!admin.role === 'Super Admin' || !admin.role === 'admin') {
      return res.send('Unauthorized Person');
    }
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
const createOffer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Enter Product ID" });
    }

    const { adminId } = req.body;
    if (!adminId) {
      return res.status(400).json({ message: "Enter Admin ID" })
    }
    const admin = await userModel.findOne({ _id: adminId, isDeleted: false });
    if (!admin) {
      return res.status(400).json({ message: "Admin Not Exist" })
    }
    if (!admin.role === 'Super Admin' || !admin.role === 'admin') {
      return res.send('Unauthorized Person');
    }

    const { discountPercentage, expirationDate } = req.body;
    if (!discountPercentage || !expirationDate) {
      return res.status(400).json({ message: "Enter All Fields" });
    }
    if (discountPercentage <= 0) {
      return res.status(400).json({ message: "Minimum Discount should be greater than 0" });
    }
    const findProduct = await Product.findOne({ _id: id });
    if (!findProduct) {
      return res.status(400).json({ message: "Product Not Found" });
    }

    var discount = (findProduct.price * discountPercentage) / 100;
    var discountedPrice = findProduct.price - discount;

    const findOffer = await Offer.findOne({ productID: id });
    if (findOffer) {
      return res.status(400).json({ message: "Offer Already Exists!" });
    }

    const newOffer = new Offer({
      productID: id,
      expirationDate,
      discountPercentage,
      discountedPrice
    });

    findProduct.offerPrice = discountedPrice;
    await findProduct.save();
    await newOffer.save();

    const populatedOffer = await Offer.findById(newOffer._id).populate('productID');
    res.status(200).json({ message: "Offer Created", Offer: populatedOffer });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: "Error Creating Offer" });
  }
}

//  ✅
const readOffers = async (req, res) => {
  try {
    const populatedOffers = await Offer.find({}).populate('productID');

    for (const offer of populatedOffers) {
      const productId = offer.productID.id;
      console.log(productId)
      await updateProductOfferPrice(productId);
    }

    res.status(200).json({
      message: "Offers fetched successfully",
      Offer: populatedOffers,
    });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ message: "Error reading offers" });
  }
};


//  ✅
const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Enter ID !" });
    }
    const { adminId } = req.body;
    if (!adminId) {
      return res.status(400).json({ message: "Enter Admin ID" })
    }
    const admin = await userModel.findOne({ _id: adminId, isDeleted: false });
    if (!admin) {
      return res.status(400).json({ message: "Admin Not Exist" })
    }
    if (!admin.role === 'Super Admin' || !admin.role === 'admin') {
      return res.send('Unauthorized Person');
    }
    const findOffer = await Offer.findOne({ _id: id });

    if (!findOffer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    const { discountPercentage, expirationDate } = req.body;
    if (discountPercentage) {
      findOffer.discountPercentage = discountPercentage;
    }
    if (expirationDate) {
      findOffer.expirationDate = expirationDate;
    }

    const findProduct = await Product.findOne({ _id: findOffer.productID });
    if (!findProduct) {
      return res.send('Product Not Exist ;')
    }
    var discount = (findProduct.price * discountPercentage) / 100;
    var discountedPrice = findProduct.price - discount;
    findOffer.discountedPrice = discountedPrice
    await findOffer.save();

    return res.status(200).json({ message: "Offer Updated Successfully", UpdatedOffer: findOffer });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: "Error Updating Offer" });
  }
}

//  ✅
const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Enter ID !" });
    }

    const { adminId } = req.body;
    if (!adminId) {
      return res.status(400).json({ message: "Enter Admin ID" })
    }
    const admin = await userModel.findOne({ _id: adminId, isDeleted: false });
    if (!admin) {
      return res.status(400).json({ message: "Admin Not Exist" })
    }
    if (!admin.role === 'Super Admin' || !admin.role === 'admin') {
      return res.send('Unauthorized Person');
    }
    
    const findProduct = await Product.findOne({ _id: id });
    if (!findProduct) {
      return res.status(400).json({ message: "Product Not Found" })
    }
    const findOffer = await Offer.findOneAndDelete({ productID: id });
    if (!findOffer) {
      return res.status(400).json({ message: "No Offer Exist" });
    }
    res.status(200).json({ message: "Offer / Sale Deleted Successfully !" })
  } catch (error) {
    res.status(400).json({ message: "Error Updating Offer" })
  }
}

// Function That Check If product's sale is expired   ✅
async function updateProductOfferPrice(productId) {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      console.log('Product not found');
      return;
    }
    const offer = await Offer.findOne({ productID: productId });
    if (offer && offer.expirationDate && offer.expirationDate > new Date()) {
      const discount = (product.price * offer.discountPercentage) / 100;
      product.offerPrice = product.price - discount;
    } else {
      console.log("Product's Price is Expired")
      product.offerPrice = 0;
    }

    await product.save();
    // console.log('Product offerPrice updated');
  } catch (error) {
    // console.error('Error updating product offerPrice:', error);
  }
}

const createAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;  // Taking name , email , password from body
    const superAdmin = await userModel.findOne({ _id: id, isDeleted: false });
    if (!superAdmin) {
      return res.status(400).json({ message: "Not Registered !" })
    }
    if (!superAdmin.role === 'Super Admin') {
      return res.status(400).json({ message: "Unauthorized" })
    }
    if (!name || !email || !password || !role || !id) {
      res.status(400).json({ message: "Some field missing !!!" });
    } else {
      const saltRounds = 10;
      bcrypt.genSalt(saltRounds, async function (err, salt) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error generating salt' });
        }
        bcrypt.hash(password, salt, async function (err, hashedPassword) {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Enter Password !!!' });
          }

          const newUser = new userModel({
            name: name,
            email: email,
            password: hashedPassword,
            otp: null,
            createdAt: null,
            expiresAt: null,
            role: role
          });

          try {
            const existingUser = await userModel.findOne({ email: email, isDeleted: false });

            if (existingUser) {
              res.status(409).json({ message: "Email Already Exists" });
            } else {
              await newUser.save();
              const token = jwt.sign({ userID: newUser.id }, process.env.JWT_SECRET_KEY, { expiresIn: '4d' });
              res.status(201).json({ message: "Admin Registered Successfully", Admin: newUser });
            }
          } catch (error) {
            res.status(500).json({ message: "Error saving user", error: error.message });
          }
        });
      });
    }
  } catch (error) {
    res.status(400).json({ message: "Error", error: error.message });
  }

}

const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Enter ID" })
    }
    const superAdmin = await userModel.findOne({ _id: id, isDeleted: false });
    if (!superAdmin) {
      return res.status(400).json({ message: "Not Registered !" })
    }
    if (!superAdmin.role === 'Super Admin') {
      return res.status(400).json({ message: "Unauthorized" })
    }
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Enter Email" });
    }
    const admin = await userModel.findOne({ email, isDeleted: false });
    if (!admin) {
      return res.status(400).json({ message: "Not Exist" })
    }
    if (!admin.role === 'admin') {
      return res.status(400).json({ message: "Its not admin" })
    }

    admin.isDeleted = true;
    admin.save();
    res.status(200).json({ message: "Admin Delted Successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error " })
  }
}

const getAllAdmins = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Enter ID" })
    }
    const superAdmin = await userModel.findOne({ _id: id, isDeleted: false });
    if (!superAdmin) {
      return res.status(400).json({ message: "Not Registered !" })
    }
    if (!superAdmin.role === 'Super Admin') {
      return res.status(400).json({ message: "Unauthorized" })
    }


    const admin = await userModel.find({ role: 'admin' });
    if (!admin) {
      return res.status(400).json({ message: "Not Exist" })
    }

    res.status(200).json({ message: "Admins are", Admins: admin })
  } catch (error) {
    res.status(400).json({ message: "Error getting admins" })

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
  createOffer,
  readOffers,
  updateOffer,
  deleteOffer,
  adminLogin,
  createAdmin,
  deleteAdmin,
  getAllAdmins,
};