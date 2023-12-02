const userModel = require('../models/User/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();
const mail = require('../utils/sendMail');
const session = require('express-session');
const bannerModel = require('../models/Admin/bannerModel');
const multer = require('multer');
const path = require('path');
const { Product } = require('../models/Admin/productModel');
const userProfile = require('../models/User/userProfileModel');
const userProfileModel = require('../models/User/userProfileModel');
const CartModel = require('../models/User/cartModel');
const WishlistModel = require('../models/User/WishlistModel');
const Order = require('../models/User/order')
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const ResponseCodes = require('../utils/methods/response')

const mongoose = require('mongoose')

const randomStringModule = require('../utils/randomString');

// Use the function

//Register Account ✅
const userRegister = async (req, res) => {
    try {
        const { name, email, password } = req.body;  // Taking name , email , password from body

        if (!name || !email || !password) {
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
                        return res.status(ResponseCodes.NOT_FOUND).json({ error: 'Enter Password !!!' });
                    }

                    const newUser = new userModel({
                        name: name,
                        email: email,
                        password: hashedPassword,
                        otp: null,
                        otpCreatedAt: null,
                        otpExpiredAt: null,
                    });

                    try {
                        const existingUser = await userModel.findOne({ email: email, isDeleted: false });

                        if (existingUser) {
                            res.status(ResponseCodes.CONFLICT).json({ message: "Email Already Exists" });
                        } else {
                            await newUser.save();
                            const token = jwt.sign({ userID: newUser.id }, process.env.JWT_SECRET_KEY, { expiresIn: '4d' });
                            res.status(ResponseCodes.CREATED).json({ message: "User Registered Successfully", token: token, user: newUser });
                        }
                    } catch (error) {
                        res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error saving user", error: error.message });
                    }
                });
            });
        }
    } catch (error) {
        res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error", error: error.message });
    }
}

//Login Account + Generate Token ✅
const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email: email, isDeleted: false });

        if (!email || !password) {
            res.status(ResponseCodes.NOT_FOUND).json({ message: "Some field missing !!!" });
        } else {
            if (!user) {
                res.status(ResponseCodes.NOT_FOUND).json({ message: "User Doesn't Exist" });
            } else {
                if (!user.isActive === true) {
                    return res.status(ResponseCodes.UNAUTHORIZED).json({ message: "Verify first" });
                }


                // Generate a new token version
                const randomString = randomStringModule.generateRandomString(10);

                // Update the token version atomically
                const updatedUser = await userModel.findOneAndUpdate(
                    { email: email, isDeleted: false },
                    { tokenVersion: randomString },
                    { new: true } // Return the modified document
                );


                // Create the JWT token using the updated token version
                const token = jwt.sign(
                    { userID: updatedUser.id, tokenVersion: updatedUser.tokenVersion },
                    process.env.JWT_SECRET_KEY,
                    { expiresIn: '4d' }
                );



                bcrypt.compare(password, user.password, function (err, result) {
                    //Comparing Password
                    if (result) { //if password is correct
                        res.status(ResponseCodes.SUCCESS).json({ message: "User Logged In successfully", token: token });
                    } else { // if wrong password
                        res.status(ResponseCodes.UNAUTHORIZED).json({ message: "Wrong Password" });
                    }
                })
            }
        }
    } catch (error) {
        res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error while login", error: error.message });
    }
};


//Forget Password : Change Password ✅
const userChangePassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (email && password) {
            const existingUser = await userModel.findOne({ email: email, isDeleted: false });
            if (!existingUser) {
                res.status(ResponseCodes.NOT_FOUND).json({ message: "User Doesn't exist" })
            } else {
                try {
                    const saltRounds = 9;

                    const salt = await bcrypt.genSalt(saltRounds);

                    const hashedPassword = await bcrypt.hash(password, salt);

                    if (!existingUser) {
                        return res.status(ResponseCodes.NOT_FOUND).json({ message: "User not found" });
                    }

                    existingUser.password = hashedPassword;
                    await existingUser.save();

                    res.status(ResponseCodes.SUCCESS).json({ message: "Password reset successful" });
                } catch (error) {
                    console.error(error);
                    res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Password reset failed", error: error.message });
                }
            }
        }
        else {
            res.status(ResponseCodes.SUCCESS).json({ message: "Enter All Fields !!!" })
        }
    } catch (error) {
        res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error Forgetting user password", error: error.message })
    }

}

// Create One time link & send to Mail ✅
const userResetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (email) {
            const existingUser = await userModel.findOne({ email: email, isDeleted: false });
            if (existingUser) {
                //Generate One Time Reset Link ; Valid for 5 Minutes
                const token = jwt.sign({ userID: existingUser.id }, process.env.JWT_SECRET_KEY, { expiresIn: '5m' });
                const link = `http://localhost:${process.env.port}/api/user/reset-password/${existingUser.id}/${token}`;
                const emailSubject = 'Password Reset Link';
                const emailHTMLBody = `<p>Your Reset Link is: ${link}</p>`;
                const recipientEmail = email;
                const mailText = 'Reset Password Link Email'
                const emailSent = await mail(recipientEmail, emailSubject, mailText, emailHTMLBody);
                if (emailSent) {
                    res.status(ResponseCodes.SUCCESS).json({ message: 'Reset Link sent successfully' });
                } else {
                    res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: 'Reset Link Email Sending Failed !!' });
                }
            } else {
                res.status(ResponseCodes.NOT_FOUND).json({ message: "User Doesn't Exist" });
            }
        } else {
            res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter Email !!!" })
        }
    } catch (error) {
        console.log(error.message);
        res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error in User Forget Password" });
    }
}

// Verify Reset Link ✅
const verifyUserResetPassword = async (req, res) => {
    const { id, token } = req.params;
    try {
        const user = await userModel.findById({ _id: id, isDeleted: false });
        if (!user) {
            res.status(ResponseCodes.NOT_FOUND).json({ message: "Invalid ID" });
        }
        else {
            jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
                if (err) {
                    res.status(ResponseCodes.UNAUTHORIZED).json({ message: 'Invalid or expired token' });
                } else {
                    res.status(ResponseCodes.SUCCESS).json({ message: "Reset Link Verified" });
                }
            });
        }
    } catch (error) {
        console.log(error.message);
        res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error in reset password', Error: error.message });
    }
}


//Show banner images  ✅
const showBannerImg = async (req, res) => {
    try {
        const data = await bannerModel.find({});

        //---- Display the data
        // data.forEach(item => {
        //     // You can access other fields here as well
        // });

        // Respond with the data in an HTTP response
        res.status(ResponseCodes.SUCCESS).json(data);
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
    }
};

//Generate OTP ; valid for 1.5 Minutes ✅
const generateOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter Email !!!" });
        } else {
            const user = await userModel.findOne({ email: email, isDeleted: false })
            if (user) {
                const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

                const createdAtDateTime = new Date();
                const expiredAtDateTime = new Date(createdAtDateTime.getTime() + 90000); // 1.5 Minute

                const newUser = await userModel.findOneAndUpdate({ email: email }, {
                    otpCreatedAt: createdAtDateTime,
                    otpExpiredAt: expiredAtDateTime,
                    otp: otpCode
                });

                const emailSubject = 'Password Reset OTP';
                const emailHTMLBody = `<p>Your OTP is: ${otpCode}</p>`;

                const recipientEmail = email;
                const mailText = 'OTP Reset Email';

                const emailSent = await mail(recipientEmail, emailSubject, mailText, emailHTMLBody);

                if (emailSent) {
                    res.status(ResponseCodes.SUCCESS).json({ message: 'OTP Email sent successfully', Email: recipientEmail });
                    await newUser.save()
                } else {
                    res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: 'Email sending failed' });
                }
            } else {
                res.status(ResponseCodes.NOT_FOUND).json({ message: "User Not Registered" });
            }
        }
    } catch (error) {
        console.log(error.message)
        res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error in generating otp", error: error.message });
    }
};

// Verify OTP ✅
const verifyOTP = async (req, res) => {
    try {
        const { email, enteredOTP } = req.body;

        if (!email || !enteredOTP) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "User ID and OTP are required." });
        }

        const otpUser = await userModel.findOne({ email: email, isDeleted: false });

        if (otpUser) {
            if (otpUser.otp === enteredOTP) {
                const currentTime = new Date();
                if (otpUser.otpExpiredAt >= currentTime) {
                    otpUser.isActive = true;
                    otpUser.save();
                    res.status(ResponseCodes.SUCCESS).json({ message: "OTP Verified Successfully" });
                } else {
                    res.status(ResponseCodes.BAD_REQUEST).json({ message: "Invalid OTP" }); // expired
                }
            } else {
                res.status(ResponseCodes.BAD_REQUEST).json({ message: "Invalid OTP" }); // wrong otp
            }
        }
        else {
            res.status(ResponseCodes.NOT_FOUND).json({ message: "User Not Found." });
        }
    } catch (error) {
        res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error in verifying OTP", error: error.message });
    }
};


// // ---------------------

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
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    }
});
const uplod = multer({ storage: store, fileFilter: imageFilter });
// ---------------------------- Controller Function
const uploadImage = async (req, res) => {
    try {
        uplod.single('image')(req, res, (err) => {
            // if (!req?.file) {
            //     return res.status(ResponseCodes.METHOD_NOT_ALLOWED).json({ message: "Only specific image file types (JPEG, PNG, GIF, SVG) are allowed!  " });
            // }

            const fileType = req.file.mimetype;
            const fileName = req.file.filename;
            const fileURL = `${fileName}`;

            res.status(ResponseCodes.SUCCESS).json({ message: "Image Uploaded to Server", url: fileURL })
        });
    } catch (error) {
        res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error Uploading User Profile" })
    }
}

// Create User Profile Image✅
const addUserProfile = async (req, res) => {
    try {
        const { userID } = req.user;
        const id = userID;
        const { image, addresses } = req.body;

        if (!id) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter ID" })
        }

        const findUser = await userModel.findOne({ _id: id, isDeleted: false });
        if (!findUser) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "User Not Registered" })
        }

        if (!image) {
            return res.status(ResponseCodes.SUCCESS).json({ message: "Enter All Fields" })
        }

        const findProfile = await userProfileModel.findOne({ userId: findUser._id })
        if (findProfile) {
            return res.status(ResponseCodes.CONFLICT).json({ message: "Profile Already Exist" });
        }

        const userProfile = new userProfileModel({
            profileImage: image,
            addresses: null,
            userId: findUser._id,
        })
        await userProfile.save();
        res.status(ResponseCodes.SUCCESS).json({ message: "User Profile updated", userProfile });
    } catch (error) {
        res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error Creating user profile", error: error.message });
    }
}

// Update User Profile Image ✅
const updateUserProfile = async (req, res) => {
    try {
        const { userID } = req.user;
        const id = userID;
        const { image } = req.body;

        if (!id) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter ID" })
        }

        const findUser = await userModel.findOne({ _id: id, isDeleted: false });
        if (!findUser) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "User Not Registered" })
        }

        const findProfile = await userProfileModel.findOne({ userId: findUser._id }).populate('userId');
        if (!findProfile) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "Profile Not Exist" });
        }
        if (image) {
            findProfile.profileImage = image;
        }
        await findProfile.save();
        res.status(ResponseCodes.SUCCESS).json({ message: "User Profile updated", findProfile });
    } catch (error) {
        res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error updating user profile", error: error.message });
    }
}

// Add to wishlist ✅
const addToWishlist = async (req, res) => {
    try {
        const { id } = req.params;
        const { userID } = req.user;

        if (!id) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "Please provide product ID" });
        }

        const findUser = await userModel.findOne({ _id: userID, isDeleted: false });

        if (!findUser) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "User is not registered" });
        }

        const findProduct = await Product.findOne({ _id: id });

        if (!findProduct) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "Product not found" });
        }

        const wishlist = await WishlistModel.findOne({ userID: findUser._id })
        if (!wishlist) {
            const newWishlist = new WishlistModel({
                wishlist: [{
                    productID: id,
                }],
                userID: findUser._id
            });
            await newWishlist.save();
            return res.status(ResponseCodes.CREATED).json({ message: "Product Added To Wishlist", Product: newWishlist });
        } else {
            const userWishlist = await WishlistModel.findOne({ userID: findUser._id });
            const wishlistItem = userWishlist.wishlist.find(item => item.productID == id);
            if (!wishlistItem) {
                userWishlist.wishlist.push({
                    productID: id,
                });
                await userWishlist.save();
                return res.status(ResponseCodes.SUCCESS).json({ message: 'Product Added to Wishlist', Wishlist: userWishlist });
            }
            else {
                res.status(ResponseCodes.CONFLICT).json({ message: "Product Already Exist in Wishlist" })
            }
        }
    } catch (error) {
        console.error(error.message);
        res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error adding to wishlist" });
    }
};

// Delete Item from wishlist ✅
const deleteWishlist = async (req, res) => {
    try {
        const { id } = req.params;
        const { userID } = req.user;

        if (!id) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "Please provide ID" });
        }

        const findUser = await userModel.findOne({ _id: userID, isDeleted: false });

        if (!findUser) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "User with this email is not registered" });
        }

        const findProduct = await Product.findOne({ _id: id });

        if (!findProduct) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "Product not found" });
        }


        const userWishlist = await WishlistModel.findOne({ userID: findUser._id }).populate('userID');
        const wishlistItem = userWishlist.wishlist.find(item => item.productID == id);
        if (!wishlistItem) {
            res.status(ResponseCodes.NOT_FOUND).json({ message: "Product Not Exist in Wishlist" })
        }
        else {
            userWishlist.wishlist.pop({
                productID: id,
            });
            await userWishlist.save();
            return res.status(ResponseCodes.SUCCESS).json({ message: 'Product Removed from Wishlist', Wishlist: userWishlist });
        }

    } catch (error) {
        console.error(error.message);
        res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error adding to wishlist" });
    }


};

// Get all items from wishlist ✅
const getUserWishlist = async (req, res) => {
    try {
        const { userID } = req.user;
        const id = userID;
        if (!id) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter id" })
        }
        const findUser = await userModel.findOne({ _id: id, isDeleted: false });
        if (!findUser) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "ID not registered" });
        }
        const wishlist = await WishlistModel.findOne({ userID: findUser._id }).populate('wishlist.productID');
        if (!wishlist || !Array.isArray(wishlist.wishlist) || wishlist.wishlist.length === 0) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "Your Wishlist is Empty" });
        }
        res.status(ResponseCodes.SUCCESS).json({ message: "Wishlist", wishlist: wishlist });
    }
    catch (error) {
        res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error Getting Wishlist", Error: error.message })
    }
}

// Add User Addresses ✅
const addAddress = async (req, res) => {
    try {
        const { userID } = req.user;
        const id = userID;
        const { addresses } = req.body;
        if (!id) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter ID" })
        }
        const findUser = await userModel.findOne({ _id: id, isDeleted: false });
        if (!findUser) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "User Not Exist" })
        }
        if (!addresses) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter Address" })
        }

        const findProfile = await userProfileModel.findOne({ userId: findUser._id });

        findProfile.addresses = addresses;

        await findProfile.save();
        res.status(ResponseCodes.SUCCESS).json({ message: "Address Added", Addresses: findProfile.addresses })
    } catch (error) {
        res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error Adding Addresses" })
    }
}


// Get  User Addresse //  ✅
const readAddresses = async (req, res) => {
    try {
        const { userID } = req.user;
        const id = userID;
        if (!id) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter ID" })
        }
        const findUser = await userModel.findOne({ _id: id, isDeleted: false });
        if (!findUser) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "User Doesn't Exist" })
        }

        const findAddresses = await userProfileModel.findOne({ userId: id });
        if (!findAddresses) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "User Addresses Don't Exist " })
        }

        const data = await userProfileModel.findOne({ userId: id }).populate('userId');
        res.status(ResponseCodes.SUCCESS).json({ Addresses: data })
    } catch (error) {
        res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error Reading Addresses", Error: error.message })
    }
}

// Update User Addresse  :id ✅
const updateUserAddresses = async (req, res) => {
    try {
        const { userID } = req.user;
        const id = userID;
        if (!id) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter ID" });
        }
        const { addresses } = req.body;
        if (!addresses) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter Address" })
        }
        const findUser = await userModel.findOneAndUpdate({ _id: id, isDeleted: false }, {
            addresses
        });

        if (!findUser) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "User Not Registered" });
        }
        const findProfile = await userProfileModel.findOne({ userId: id })
        if (!findProfile) {
            const newProfile = new userProfile({
                addresses: addresses,
                userId: userID
            });
            await newProfile.save();
            return res.status(ResponseCodes.SUCCESS).json({ message: "User Addresses Updated", newProfile })
        } else {
            findProfile.addresses = addresses;
            findProfile.save();
            res.status(ResponseCodes.SUCCESS).json({ message: "User Addresses Updated", findProfile })
        }
    } catch (error) {
        res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error Updating Addresses" })
    }
}

// Get New Arrivals : New Products (Less than 30 Days) //  ✅
const newArrivals = async (req, res) => {
    try {
        const daysAgo = new Date(new Date().setDate(new Date().getDate() - 30));
        const newArrivals = await Product.find({ createdAt: { $gte: daysAgo } }).exec();
        res.status(ResponseCodes.SUCCESS).json({ message: "New Arrivals Found", NewArrivals: newArrivals })
    } catch (err) {
        console.error(err.message);
        res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ error: 'Error Getting New Arrivals' });
    }
};

// Delete item from cart//  ✅
const deleteCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, email } = req.body;

        if (!email) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter All Fields" });
        }


        const user = await userModel.findOne({ email, isDeleted: false });

        if (!user) {
            return res.status(ResponseCodes.NOT_FOUND).json({ error: 'User not found' });
        }

        const findProduct = await Product.findOne({ _id: id });

        if (!findProduct) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "Product Not Found" });
        }
        const userCart = await CartModel.findOne({ userID: user._id });
        if (!userCart) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "Create Your Cart !" })
        }
        else {
            const cartItemIndex = userCart.cart.findIndex(item => item.productID == id);

            if (cartItemIndex !== -1) {
                userCart.cart.splice(cartItemIndex, 1);
                await userCart.save();
                return res.json({ message: "Product removed from the cart" });
            } else {
                res.status(ResponseCodes.NOT_FOUND).json({ message: "Cart is Empty" })
            }
        }
    } catch (err) {
        return res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ error: 'Error in Deleting Cart' });
    }
};


// If Cart (Add to Cart) Else : Update Cart ✅
const addToCart = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        const { userID } = req.user;

        if (!id || !quantity) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter All Fields" });
        }

        if (quantity <= 0) {
            return res.status(ResponseCodes.BAD_REQUEST).json({ error: 'Invalid quantity' });
        }

        const user = await userModel.findOne({ _id: userID, isDeleted: false });

        if (!user) {
            return res.status(ResponseCodes.NOT_FOUND).json({ error: 'User not found' });
        }

        const findProduct = await Product.findOne({ _id: id });

        if (!findProduct) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "Product Not Found" });
        }

        const userCart = await CartModel.findOne({ userID: user._id }).populate('userID');

        if (!userCart) {
            let totalPrice = findProduct.price * quantity;
            const newCart = new CartModel({
                cart: [{
                    productID: id,
                    quantity,
                    totalPrice
                }],
                userID: user._id
            });
            await newCart.save();
            return res.status(ResponseCodes.SUCCESS).json({ message: 'Product added to cart', cart: newCart });
        } else {
            if (quantity > findProduct.quantity) {
                return res.status(ResponseCodes.NOT_FOUND).json({ message: "This Quantity is not available in Stock" });
            }

            let totalPrice = findProduct.price * quantity;
            const cartItem = userCart.cart.find(item => item.productID == id);

            if (!cartItem) {
                userCart.cart.push({
                    productID: id,
                    quantity,
                    totalPrice
                });
            } else {
                // Update quantity and totalPrice when the item already exists in the cart
                cartItem.quantity = quantity;
                cartItem.totalPrice = totalPrice; // Update totalPrice
            }

            await userCart.save();
            return res.status(ResponseCodes.SUCCESS).json({ message: 'Cart item quantity updated', cart: userCart });
        }
    } catch (err) {
        return res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ error: 'Error in Cart' });
    }
};


// Show User Cart  ✅
const showUserCart = async (req, res) => {
    try {
        const { userID } = req.user;
        const id = userID;
        if (!id) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter ID" })
        }
        const user = await userModel.findOne({ _id: id, isDeleted: false });
        if (!user) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "User Not Registered" });
        }
        const userCart = await CartModel.findOne({ userID: user._id }).populate('cart.productID');
        if (!userCart) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "User Don't Have Cart" })
        }
        const data = userCart.cart;
        res.status(ResponseCodes.CREATED).json({ message: "Getting User Cart", data, });
    } catch (error) {
        res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error Getting User Cart", Error: error.message });
    }
}

// ✅
const validateCoupon = async (req, res) => {
    try {
        const enteredCouponCode = req.body.code;
        if (!enteredCouponCode) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter Coupon Code" });
        }
        const { id } = req.params;
        if (!id) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter ID" })
        }
        const findProduct = await Product.findOne({ _id: id });
        if (!findProduct) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "Product Not found" })
        }
        const productCouponCode = findProduct.coupon.code;
        const couponExpirationDate = findProduct.coupon.expirationDate;
        const todayDate = new Date();
        const productPrice = findProduct.price;
        const discountPercentage = findProduct.coupon.discountPercentage;
        if (enteredCouponCode === productCouponCode && todayDate < couponExpirationDate) {
            var discount = (productPrice * discountPercentage) / 100;
            var discountedPrice = productPrice - discount;
            return res.json({ message: "Coupon Verified", priceAfterDiscount: discountedPrice, oldPrice: productPrice })
        }
        res.status(ResponseCodes.BAD_REQUEST).json({ message: "Invalid / Expired Coupon" })
    } catch (error) {
        console.error(error);
        res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error validating product coupon" });
    }
}

const createCheckOUtSession = async (req, res) => {
    try {
        const { products } = req.body;

        if (!products) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter Products in req.body" });
        }

        const lineItems = [];
        for (const product of products) {
            const productData = await Product.findById(product._id);

            if (!productData) {
                return res.status(ResponseCodes.NOT_FOUND).json({ message: "Product not found" });
            }

            lineItems.push({
                price_data: {
                    currency: "USD",
                    product_data: {
                        name: productData.name,
                        images: [productData.images[0]] // using the first image of product to show on checkout page 
                    },
                    unit_amount: productData.price * 100,
                },
                quantity: product.quantity,
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: "https://your-success-url.com", // Replace with your success URL
            cancel_url: "https://your-cancel-url.com", // Replace with your cancel URL
        });

        res.status(ResponseCodes.CREATED).json({ message: "Stripe Session ID Created !", ID: session.id });
    } catch (error) {
        console.error(error);
        res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error creating checkout session" });
    }
}


const createOrder = async (req, res) => {
    try {
        const { userID } = req.user;
        const id = userID;
        if (!id) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter ID!" });
        }

        const user = await userModel.findOne({ _id: id, isDeleted: false });
        if (!user) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "User Not Exist!" });
        }

        const userCart = await CartModel.findOne({ userID: id }).populate('cart.productID');

        if (userCart.cart.length === 0) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "User's cart is empty" });
        }
        if (!userCart) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "User's cart not found" });
        }


        let order = await Order.findOne({ userID: id });

        if (!order) {
            order = new Order({
                order: [],
                userID: id,
            });
        }

        let totalOrderPrice = 0; // Initialize the total order price.

        for (const cartItem of userCart.cart) {
            const productPrice = cartItem.productID.price; // Assuming you have a 'price' field in the 'Product' model.
            const itemTotalPrice = productPrice * cartItem.quantity;
            totalOrderPrice += itemTotalPrice; // Add the item's total price to the order's total price.

            order.order.push({
                productID: cartItem.productID._id,
                quantity: cartItem.quantity,
                paymentStatus: 'pending',
                orderStatus: 'pending',
                totalPrice: itemTotalPrice, // Store the item's total price in the order.
            });
        }

        order.totalPrice = totalOrderPrice; // Store the total order price in the order.

        await order.save();

        userCart.cart = [];

        await userCart.save();

        res.status(ResponseCodes.CREATED).json({ message: "Order Created!", order });
    } catch (error) {
        res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error Creating Order", Error: error.message });
    }
}

const getUserOrders = async (req, res) => {
    try {
        const { userID } = req.user;
        const id = userID;
        if (!id) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter ID" })
        }
        const user = await userModel.findOne({ _id: id, isDeleted: false })
        if (!user) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "User Not Found" });
        }
        const userOrders = await Order.findOne({ userID: id });
        res.status(ResponseCodes.SUCCESS).json({ message: "User Orders Found", userOrders })
    } catch (error) {
        res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error Getting User's Orders" })
    }
}

const cancelOrder = async (req, res) => {
    try {
        const { userID } = req.user;
        const id = userID;
        const { productID } = req.params;

        if (!productID) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter Product ID" });
        }

        if (!id) {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "Enter ID !!!" });
        }

        const userOrder = await Order.findOne({ userID: id });

        if (!userOrder || userOrder.order.length === 0) {
            return res.status(ResponseCodes.BAD_REQUEST).json({ message: "No Order Found" });
        }

        // Find the index of the product within the order
        const orderIndex = userOrder.order.findIndex(order => order.productID == productID);

        if (orderIndex !== -1) {
            // Set the status of the product to "cancelled" (you may have a different status field)
            userOrder.order[orderIndex].orderStatus = "cancelled";

            // Save the updated order
            await userOrder.save();

            return res.status(ResponseCodes.SUCCESS).json({ message: "Product cancelled in the order", order: userOrder.order[orderIndex] });
        } else {
            return res.status(ResponseCodes.NOT_FOUND).json({ message: "Product not found in the order" });
        }
    } catch (error) {
        return res.status(ResponseCodes.INTERNAL_SERVER_ERROR).json({ message: "Error Cancelling Order", Error: error.message });
    }
}




module.exports = {
    userRegister,
    userLogin,
    userChangePassword,
    userResetPassword,
    verifyUserResetPassword,
    showBannerImg,
    generateOTP,
    verifyOTP,
    uploadImage,
    addUserProfile,
    addToWishlist,
    deleteWishlist,
    getUserWishlist,
    addAddress,
    readAddresses,
    updateUserAddresses,
    newArrivals,
    addToCart,
    deleteCartItem,
    validateCoupon,
    updateUserProfile,
    showUserCart,
    createCheckOUtSession,
    createOrder,
    getUserOrders,
    cancelOrder
};

