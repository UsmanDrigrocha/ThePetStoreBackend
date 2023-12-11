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
const Order = require('../models/User/order')
const saveNotificaton = require('../utils/saveNotification')

const ResponseCodes = require('../utils/methods/response')

const randomStringModule = require('../utils/randomString');


// ### Starting Admin Login + Validation ; req.user

//  ✅
const showRegistedUsers = async (req, res) => {
  try {
    try {
      const { userID } = req.user;
      const findAdmin = await userModel.findOne({ _id: userID, isDeleted: false });
      console.log(findAdmin)
      if (!findAdmin) {
        return res.status(ResponseCodes.NOT_FOUND).json({ message: "Not Found" })
      }
      if (!findAdmin.role === 'Super Admin' || !findAdmin.role === 'admin') {
        return res.status(ResponseCodes.UNAUTHORIZED).json('Unauthorized Person');
      }
      const data = await userModel.find({})
      res.status(ResponseCodes.SUCCESS).json(data);
    } catch (error) {
      console.log(error)
      res.status(ResponseCodes.BAD_REQUEST).json({ message: "Error Getting Data from DB", error: error.message })
    }
  } catch (error) {
    console.error('Error retrieving Users:', error);
    res.status(ResponseCodes.BAD_REQUEST).json({ message: 'Internal Server Error' });
  }
};

//Login Account + Generate Token ✅
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email });
    if (!email) { // if any field missing
      return res.status(ResponseCodes.BAD_REQUEST).json({ message: "Email field missing !!!" });
    }

    if (!password) {
      return res.status(ResponseCodes.BAD_REQUEST).json({ message: "Password field missing !!!" });
    }
    else {
      if (!user) { // if email doesn't exist in DB
        res.status(ResponseCodes.NOT_FOUND).json({ message: "User Doesn't Exists" });
      } else {
        if (!user.role === 'Super Admin' || !user.role === 'admin') {
          return res.send('Unauthorized to LOGIN');
        }
        const randomString = randomStringModule.generateRandomString(10);

        const updatedUser = await userModel.findOneAndUpdate(
          { email: email, isDeleted: false },
          { tokenVersion: randomString },
          { new: true } // Return the modified document
        );
        // randomString
        const token = jwt.sign({ userID: user.id, tokenVersion: updatedUser.tokenVersion }, process.env.JWT_SECRET_KEY, { expiresIn: '4d' });
        bcrypt.compare(password, user.password, function (err, result) {
          //Comparing Password
          if (result) { //if password is correct
            res.status(ResponseCodes.ACCEPTED).json({ message: "User Logged In successfully", adminToken: token });
          } else { // if wrong password
            res.status(ResponseCodes.UNAUTHORIZED).json({ message: "Wrong Password" });
          }
        });
      }
    }
  } catch (error) {
    res.status(ResponseCodes.BAD_REQUEST).json({ message: "Error while login", error: error.message });
  }
};

//  ✅
const showBannerImg = async (req, res) => {
  try {
    const { userID } = req.user;
    const findAdmin = await userModel.findOne({ _id: userID, isDeleted: false });
    console.log(findAdmin)
    if (!findAdmin) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Not Found" })
    }
    if (!findAdmin.role === 'Super Admin' || !findAdmin.role === 'admin') {
      return res.status(ResponseCodes.UNAUTHORIZED).json('Unauthorized Person');
    }
    const data = await bannerModel.find({});
    res.status(ResponseCodes.SUCCESS).json(data);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
};


const getAllCategories = async (req, res) => {
  try {
    const { userID } = req.user;
    const findAdmin = await userModel.findOne({ _id: userID, isDeleted: false });
    console.log(findAdmin)
    if (!findAdmin) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Not Found" })
    }
    if (!findAdmin.role === 'Super Admin' || !findAdmin.role === 'admin') {
      return res.status(ResponseCodes.UNAUTHORIZED).json('Unauthorized Person');
    }
    const allCategories = await Category.find({});
    res.status(ResponseCodes.ACCEPTED).json({
      message: "Categories Found",
      Categories: allCategories
    })
  } catch (error) {
    res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error while getting categories' });
  }
}


//  ✅
const createCategory = async (req, res) => {
  try {
    const { userID } = req.user;
    const id = userID;
    const admin = await userModel.findOne({ _id: id, isDeleted: false });
    if (!admin) {
      return res.status(ResponseCodes.BAD_REQUEST).json({ message: "User Not Exist !!!!!!!!" });
    }
    if (!admin.role === 'Super Admin' || !admin.role === 'admin') {
      return res.status(ResponseCodes.UNAUTHORIZED).json('Unauthorized Person');
    }
    const { name, image } = req.body;
    if (!name) {
      return res.status(ResponseCodes.BAD_REQUEST).json({ message: "Enter Name of Category !!!" });
    }
    if (!image) {
      return res.status(ResponseCodes.BAD_REQUEST).json({ message: "Enter Image of Category !!!" });
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
        return res.status(ResponseCodes.BAD_REQUEST).json({ message: "No Such category ID Exist" });
      }
    }

    await categoryData.save();
    res.status(ResponseCodes.SUCCESS).json({ message: "Category Created Successfully", categoryData });
  }
  catch (error) {
    console.log(error.message);
    res.status(ResponseCodes.BAD_REQUEST).json({ message: "Error Creating Category" });
  }
};


//  ✅
const readOneCategory = async (req, res) => {
  try {

    const { id } = req.params;
    if (!id) {
      return res.status(ResponseCodes.BAD_REQUEST).json({ message: "Enter ID" });
    }
    const objId = new mongoose.Types.ObjectId(id);
    const data = await Category.findOne({ _id: objId }); // Change "id" to "_id"

    if (!data) {
      res.status(ResponseCodes.NOT_FOUND).json({ message: "Not Found" }); // Change status code to ResponseCodes.NOT_FOUND for "Not Found"
    } else {
      res.status(ResponseCodes.SUCCESS).json({ message: "Category Found", data: data });
    }
  } catch (error) {
    res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error Getting Category !!!!", error: error.message });
  }
};


//  ✅
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image, categoryID } = req.body;
    const { userID } = req.user;
    const adminId = userID;

    if (!adminId) {
      return res.status(ResponseCodes.BAD_REQUEST).json({ message: "Enter All Fields" });
    }

    const admin = await userModel.findOne({ _id: adminId, isDeleted: false });

    if (!admin) {
      return res.status(ResponseCodes.BAD_REQUEST).json({ message: "Admin Not Exist" });
    }

    if (!admin.role === 'Super Admin' || !admin.role === 'admin') {
      return res.status(ResponseCodes.UNAUTHORIZED).send('Unauthorized Person');
    }

    if (!id) {
      return res.status(ResponseCodes.BAD_REQUEST).json({ message: "Enter ID" });
    }

    const objId = new mongoose.Types.ObjectId(id);
    const existingCategory = await Category.findById(objId);

    if (!existingCategory) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Category not found" });
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
    res.status(ResponseCodes.SUCCESS).json({ message: "Category updated", data: updatedCategory });
  } catch (error) {
    res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error updating category", error: error.message });
  }
};

//  ✅
const getProductCategories = async (req, res) => {
  try {
    const data = await Category.find({});
    res.status(ResponseCodes.SUCCESS).json(data);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error Getting Product Categories', error: error.message });
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
    res.status(ResponseCodes.CREATED).json({ message: "Banner Created Successfully", fileURL });
  } catch (error) {
    res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error Testing Img Upload" });
  }
};

//  ✅
const getChildCategories = async (req, res) => {
  try {
    const { id } = req.params;
    const findChildCategory = await Category.find({ categoryID: id });
    if (!findChildCategory) {
      return res.status(ResponseCodes.SUCCESS).json({ message: "Invalid ID / Not Exist" })
    }
    res.status(ResponseCodes.SUCCESS).json({ message: "Getting Child Categories", child: findChildCategory });
  } catch (error) {
    res.status(ResponseCodes.BAD_REQUEST).json({ message: "Error Getting Child Categories" })
  }
}
//  ✅
const deleteCategory = async (req, res) => {
  try {
    const { userID } = req.user;
    const findAdmin = await userModel.findOne({ _id: userID, isDeleted: false });
    console.log(findAdmin)
    if (!findAdmin) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Not Found" })
    }
    if (!findAdmin.role === 'Super Admin' || !findAdmin.role === 'admin') {
      return res.status(ResponseCodes.UNAUTHORIZED).json('Unauthorized Person');
    }
    const adminId = userID;
    const { id } = req.params;

    if (!id) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter ID" });
    }
    if (!adminId) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter Admin ID" })
    }
    const admin = await userModel.findOne({ _id: adminId, isDeleted: false });
    if (!admin) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Admin Not Exist" })
    }
    if (!admin.role === 'Super Admin' || !admin.role === 'admin') {
      return res.send('Unauthorized Person');
    }

    const objId = new mongoose.Types.ObjectId(id);
    const existingCategory = await Category.findOneAndDelete(objId);
    res.status(ResponseCodes.SUCCESS).json({ message: "Category Deleted", data: existingCategory });
  } catch (error) {
    res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error updating category", error: error.message });
  }
};

//  ✅
const createProduct = async (req, res) => {
  try {
    const { name, price, description, size, quantity, animal, categoryID, coupon, images } = req.body;
    if (!name || !price || !description || !size || !quantity || !categoryID || !animal || !images) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter all Fields" })
    } else {
      const objId = new mongoose.Types.ObjectId(categoryID);
      const existingCategory = await Category.findById(objId);
      if (!existingCategory) {
        return res.status(ResponseCodes.NOT_FOUND).json({ message: "No Such Parent Exist" });
      }

      const { userID } = req.user;
      const adminId = userID;
      if (!adminId) {
        return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter Admin ID" })
      }
      const admin = await userModel.findOne({ _id: adminId, isDeleted: false });
      if (!admin) {
        return res.status(ResponseCodes.NOT_FOUND).json({ message: "Admin Not Exist" })
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
      res.status(ResponseCodes.CREATED).json({ message: "Product Created !", Product: newProduct })
    }
  } catch (error) {
    console.log(error.message)
    res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error creating Product", Error: error.message });
  }
}

//  ✅
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});

    if (!products || products.length === 0) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "No products found" });
    }

    for (const product of products) {
      const productId = product._id;
      await updateProductOfferPrice(productId);
    }

    res.status(ResponseCodes.SUCCESS).json({ message: "All Products", Products: products });
  } catch (error) {
    console.error("Error updating product offerPrices:", error);
    res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error Getting products" });
  }
}


//  ✅
const getProductsByCategories = async (req, res) => {
  try {
    const { id } = req.params;
    const findProducts = await Product.find({ categoryID: id });
    if (!findProducts) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Invalid ID / Not Exist" })
    }
    for (const product of findProducts) {
      const productId = findProducts._id;
      await updateProductOfferPrice(productId);
    }
    res.status(ResponseCodes.SUCCESS).json({ message: "Getting Products by Categories", products: findProducts });
  } catch (error) {
    res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error Getting Products by categories" })
  }
}

//  ✅
const getOneProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const findProduct = await Product.findOne({ _id: id }).populate('categoryID');
    if (!findProduct) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Product Not Found" })
    }
    updateProductOfferPrice(id)
    res.status(ResponseCodes.SUCCESS).json({ message: "Product Found", findProduct })
  } catch (error) {
    res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error Getting Product" })

  }
}

//  ✅
const UpdateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, size, quantity, animal, categoryID, coupon, images } = req.body;
    const findProduct = await Product.findOne({ _id: id });
    if (!findProduct) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Product Not Found" })
    }
    const { userID } = req.user;
    const adminId = userID;
    if (!adminId) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter Admin ID" })
    }
    const admin = await userModel.findOne({ _id: adminId, isDeleted: false });
    if (!admin) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Admin Not Exist" })
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
    res.status(ResponseCodes.SUCCESS).json({ message: "Product Updated", findProduct })
  } catch (error) {
    res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error Getting Product" })
  }
}

//  ✅
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { userID } = req.user;
    const adminId = userID;
    if (!adminId) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter Admin ID" })
    }
    const admin = await userModel.findOne({ _id: adminId, isDeleted: false });
    if (!admin) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Admin Not Exist" })
    }
    if (!admin.role === 'Super Admin' || !admin.role === 'admin') {
      return res.send('Unauthorized Person');
    }
    const findProduct = await Product.findOneAndDelete({ _id: id });
    if (!findProduct) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Product Not Found" })
    }
    res.status(ResponseCodes.SUCCESS).json({ message: "Deleted Product", findProduct })
  } catch (error) {
    res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error Deleting Product" })
  }
}

//  ✅
const createOffer = async (req, res) => {
  try {

    const { id } = req.params;
    if (!id) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter Product ID" });
    }

    const { userID } = req.user;
    const adminId = userID;
    if (!adminId) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter Admin ID" })
    }
    const admin = await userModel.findOne({ _id: adminId, isDeleted: false });
    if (!admin) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Admin Not Exist" })
    }
    if (!admin.role === 'Super Admin' || !admin.role === 'admin') {
      return res.send('Unauthorized Person');
    }

    const { discountPercentage, expirationDate } = req.body;
    if (!discountPercentage || !expirationDate) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter All Fields" });
    }
    if (discountPercentage <= 0) {
      return res.status(ResponseCodes.BAD_REQUEST).json({ message: "Minimum Discount should be greater than 0" });
    }
    const findProduct = await Product.findOne({ _id: id });
    if (!findProduct) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Product Not Found" });
    }

    var discount = (findProduct.price * discountPercentage) / 100;
    var discountedPrice = findProduct.price - discount;

    const findOffer = await Offer.findOne({ productID: id });
    if (findOffer) {
      return res.status(ResponseCodes.CONFLICT).json({ message: "Offer Already Exists!" });
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
    const notification = await saveNotificaton(newOffer._id)
    res.status(ResponseCodes.SUCCESS).json({ message: "Offer Created", Offer: populatedOffer });
  } catch (error) {
    console.log(error.message);
    res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error Creating Offer" });
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

    res.status(ResponseCodes.SUCCESS).json({
      message: "Offers fetched successfully",
      Offer: populatedOffers,
    });
  } catch (error) {
    console.error(error.message);
    res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error reading offers" });
  }
};


//  ✅
const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter ID !" });
    }
    const { userID } = req.user;
    const adminId = userID;
    if (!adminId) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter Admin ID" })
    }
    const admin = await userModel.findOne({ _id: adminId, isDeleted: false });
    if (!admin) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Admin Not Exist" })
    }
    if (!admin.role === 'Super Admin' || !admin.role === 'admin') {
      return res.send('Unauthorized Person');
    }
    const findOffer = await Offer.findOne({ _id: id });

    if (!findOffer) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Offer not found" });
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

    return res.status(ResponseCodes.SUCCESS).json({ message: "Offer Updated Successfully", UpdatedOffer: findOffer });
  } catch (error) {
    console.log(error.message);
    res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error Updating Offer" });
  }
}

//  ✅
const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter ID !" });
    }

    const { userID } = req.user;
    const adminId = userID;
    if (!adminId) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter Admin ID" })
    }
    const admin = await userModel.findOne({ _id: adminId, isDeleted: false });
    if (!admin) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Admin Not Exist" })
    }
    if (!admin.role === 'Super Admin' || !admin.role === 'admin') {
      return res.send('Unauthorized Person');
    }

    const findProduct = await Product.findOne({ _id: id });
    if (!findProduct) {
      return res.status(ResponseCodes.BAD_REQUEST).json({ message: "Product Not Found" })
    }
    const findOffer = await Offer.findOneAndDelete({ productID: id });
    if (!findOffer) {
      return res.status(ResponseCodes.BAD_REQUEST).json({ message: "No Offer Exist" });
    }
    res.status(ResponseCodes.SUCCESS).json({ message: "Offer / Sale Deleted Successfully !" })
  } catch (error) {
    res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error Updating Offer" })
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
    const { userID } = req.user;
    const id = userID;
    const { name, email, password, role } = req.body;  // Taking name , email , password from body
    const superAdmin = await userModel.findOne({ _id: id, isDeleted: false });
    if (!superAdmin) {
      return res.status(ResponseCodes.BAD_REQUEST).json({ message: "Not Registered !" })
    }
    if (!superAdmin.role === 'Super Admin') {
      return res.status(ResponseCodes.UNAUTHORIZED).json({ message: "Unauthorized" })
    }
    if (!name || !email || !password || !role) {
      res.status(ResponseCodes.NOT_FOUND).json({ message: "Some field missing !!!" });
    } else {
      const saltRounds = 10;
      bcrypt.genSalt(saltRounds, async function (err, salt) {
        if (err) {
          console.error(err);
          return res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ error: 'Error generating salt' });
        }
        bcrypt.hash(password, salt, async function (err, hashedPassword) {
          if (err) {
            console.error(err);
            return res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ error: 'Enter Password !!!' });
          }

          const newUser = new userModel({
            name: name,
            email: email,
            password: hashedPassword,
            otp: null,
            createdAt: null,
            expiresAt: null,
            role: role,
            isActive: true
          });

          try {
            const existingUser = await userModel.findOne({ email: email, isDeleted: false });

            if (existingUser) {
              res.status(ResponseCodes.CONFLICT).json({ message: "Email Already Exists" });
            } else {
              await newUser.save();
              const token = jwt.sign({ userID: newUser.id }, process.env.JWT_SECRET_KEY, { expiresIn: '4d' });
              res.status(ResponseCodes.CREATED).json({ message: "User Registered Successfully", User: newUser });
            }
          } catch (error) {
            res.status(ResponseCodes.BAD_REQUEST).json({ message: "Error saving user", error: error.message });
          }
        });
      });
    }
  } catch (error) {
    res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error", error: error.message });
  }

}

const deleteAdmin = async (req, res) => {
  try {
    const { userID } = req.user;
    const id = userID;
    if (!id) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter ID" })
    }
    const superAdmin = await userModel.findOne({ _id: id, isDeleted: false });
    if (!superAdmin) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Not Registered !" })
    }
    if (!superAdmin.role === 'Super Admin') {
      return res.status(ResponseCodes.UNAUTHORIZED).json({ message: "Unauthorized to Perform Action" })
    }
    const { idToDelete } = req.params;
    if (!idToDelete) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter id" });
    }
    const admin = await userModel.findOne({ _id: idToDelete, isDeleted: false });
    if (!admin) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Not Exist" })
    }
    // if (!admin.role === 'admin') {
    //   return res.status(ResponseCodes.UNAUTHORIZED).json({ message: "Its not admin" })
    // }

    admin.isDeleted = true;
    await admin.save();
    res.status(ResponseCodes.SUCCESS).json({ message: "Admin Delted Successfully" });
  } catch (error) {
    res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error ", Error: error.message })
  }
}

const getAllAdmins = async (req, res) => {
  try {
    const { userID } = req.user;
    const id = userID;
    if (!id) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter ID" })
    }
    const superAdmin = await userModel.findOne({ _id: id, isDeleted: false });
    if (!superAdmin) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Not Registered !" })
    }
    if (!superAdmin.role === 'Super Admin') {
      return res.status(ResponseCodes.UNAUTHORIZED).json({ message: "Unauthorized" })
    }


    const admin = await userModel.find({ role: 'admin' });
    if (!admin) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Not Exist" })
    }

    res.status(ResponseCodes.SUCCESS).json({ message: "Admins are", Admins: admin })
  } catch (error) {
    res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error getting admins" })

  }
}

const editOrderStatus = async (req, res) => {
  try {
    const { id } = req.params; // user ID
    const { productID, paymentStatus, orderStatus } = req.body;
    const { userID } = req.user;
    const adminID = userID;
    if (!adminID) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter Admin ID" });
    }
    const admin = await userModel.findOne({ _id: adminID, isDeleted: false });
    if (!admin) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Admin Not Exist" })
    }

    if (!admin.role === 'Super Admin' || !admin.role === 'admin') {
      return res.send('Unauthorized Person');
    }

    if (!productID) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter Product ID" });
    }

    if (!id) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter ID !!!" });
    }


    const findUser = await userModel.findOne({ _id: id });
    if (!findUser) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "User Not Registered" })
    }
    const userOrder = await Order.findOne({ userID: id }).populate('userID');

    if (!userOrder || userOrder.order.length === 0) {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "No Order Found" });
    }

    // Find the index of the product within the order
    const orderIndex = userOrder.order.findIndex(order => order.productID == productID);

    if (orderIndex !== -1) {
      if (paymentStatus) {
        userOrder.order[orderIndex].paymentStatus = paymentStatus;
      }

      if (orderStatus) {
        userOrder.order[orderIndex].orderStatus = orderStatus;
      }

      // Save the updated order
      await userOrder.save();
      // order: userOrder.order[orderIndex]
      return res.json({ message: "Product order Updated", userOrder });
    } else {
      return res.status(ResponseCodes.NOT_FOUND).json({ message: "Product not found in the order" });
    }
  } catch (error) {
    return res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error Cancelling Order", Error: error.message });
  }
}

const getAllOrders = async (req, res) => {
  try {
    // const { id } = req.user;
    // const findAdmin = await userModel.findOne({
    //   _id: id,
    //   isDeleted: false,
    //   $or: [
    //     { role: 'admin' },
    //     { role: 'Super Admin' }
    //   ]
    // });
    // if (!findAdmin) {
    //   return res.status(ResponseCodes.BAD_REQUEST).json({ message: "Unauthorized Person" })
    // }
    const orders = await Order.find({});
    res.status(ResponseCodes.ACCEPTED).json({ message: "Orders", Orders: orders })

  } catch (error) {
    res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ Error: error.message })
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
  editOrderStatus,
  getAllOrders
};
