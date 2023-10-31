const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();
const mail = require('../utils/sendMail');
const session = require('express-session');
const bannerModel = require('../models/bannerModel');
const multer = require('multer');
const path = require('path');
const { Product } = require('../models/productModel');


//Register Account
const userRegister = async (req, res) => {
    try {
        const { name, email, password } = req.body;  // Taking name , email , password from body

        if (!name || !email || !password) {
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
                        profileImage: null,
                        wishlist: null,
                        addresses: null,
                        cart: null,
                    });

                    try {
                        const existingUser = await userModel.findOne({ email: email });

                        if (existingUser) {
                            res.status(409).json({ message: "Email Already Exists" });
                        } else {
                            await newUser.save();
                            const token = jwt.sign({ userID: newUser.id }, process.env.JWT_SECRET_KEY, { expiresIn: '4d' });
                            res.status(201).json({ message: "User Registered Successfully", token: token, user: newUser });
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

//Login Account + Generate Token
const userLogin = async (req, res) => {
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
                const token = jwt.sign({ userID: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: '4d' });
                bcrypt.compare(password, user.password, function (err, result) {
                    //Comparing Password

                    if (result) { //if password is correct
                        req.session.token = token;
                        res.status(202).json({ message: "User Logged In successfully", token: token });
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

//Forget Password : Change Password
const userChangePassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (email && password) {
            const existingUser = await userModel.findOne({ email: email });
            if (!existingUser) {
                res.status(400).json({ message: "User Doesn't exist" })
            } else {
                try {
                    const saltRounds = 9;

                    const salt = await bcrypt.genSalt(saltRounds);

                    const hashedPassword = await bcrypt.hash(password, salt);

                    if (!existingUser) {
                        return res.status(404).json({ message: "User not found" });
                    }

                    existingUser.password = hashedPassword;
                    await existingUser.save();

                    res.status(200).json({ message: "Password reset successful" });
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ message: "Password reset failed", error: error.message });
                }
            }
        }
        else {
            res.status(200).json({ message: "Enter All Fields !!!" })
        }
    } catch (error) {
        res.status(400).json({ message: "Error Forgetting user password", error: error.message })
    }

}

// Create One time link & send to Mail
const userResetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (email) {
            const existingUser = await userModel.findOne({ email: email });
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
                    res.status(200).json({ message: 'Reset Link sent successfully' });
                } else {
                    res.status(500).json({ message: 'Reset Link Email Sending Failed !!' });
                }
            } else {
                res.status(400).json({ message: "User Doesn't Exist" });
            }
        } else {
            res.status(400).json({ message: "Enter Email !!!" })
        }
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ message: "Error in User Forget Password" });
    }
}

// Verify Reset Link
const verifyUserResetPassword = async (req, res) => {
    const { id, token } = req.params;
    try {
        const user = await userModel.findById(id);
        if (!user) {
            res.status(400).json({ message: "Invalid ID" });
        }
        else {
            jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
                if (err) {
                    res.status(400).json({ message: 'Invalid or expired token' });
                } else {
                    res.status(200).json({ message: "Reset Link Verified" });
                }
            });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Error in reset password' });
    }
}


//Show banner images 
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

//Generate OTP ; valid for 1.5 Minutes
const generateOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: "Enter Email !!!" });
        } else {
            const user = await userModel.findOne({ email: email })
            if (user) {
                const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

                const createdAtDateTime = new Date();
                const expiredAtDateTime = new Date(createdAtDateTime.getTime() + 90000); // 1.5 Minute

                const newUser = await userModel.findOneAndUpdate({ email: email }, {
                    createdAt: createdAtDateTime,
                    expiresAt: expiredAtDateTime,
                    otp: otpCode
                });

                const emailSubject = 'Password Reset OTP';
                const emailHTMLBody = `<p>Your OTP is: ${otpCode}</p>`;

                const recipientEmail = email;
                const mailText = 'OTP Reset Email';

                const emailSent = await mail(recipientEmail, emailSubject, mailText, emailHTMLBody);

                if (emailSent) {
                    res.status(200).json({ message: 'OTP Email sent successfully', Email: recipientEmail });
                } else {
                    res.status(500).json({ message: 'Email sending failed' });
                }
            } else {
                res.status(400).json({ message: "User Not Registered" });
            }
        }
    } catch (error) {
        console.log(error.message)
        res.status(400).json({ message: "Error in generating otp", error: error.message });
    }
};

// Verify OTP
const verifyOTP = async (req, res) => {
    try {
        const { email, enteredOTP } = req.body;

        if (!email || !enteredOTP) {
            return res.status(400).json({ message: "User ID and OTP are required." });
        }

        const otpUser = await userModel.findOne({ email: email });

        if (otpUser) {
            if (otpUser.otp === enteredOTP) {
                const currentTime = new Date();
                if (otpUser.expiresAt >= currentTime) {
                    res.status(200).json({ message: "OTP Verified Successfully" });
                } else {
                    res.status(400).json({ message: "Invalid OTP" }); // expired
                }
            } else {
                res.status(400).json({ message: "Invalid OTP" }); // wrong otp
            }
        }
        else {
            res.status(400).json({ message: "User Not Found." });
        }
    } catch (error) {
        res.status(400).json({ message: "Error in verifying OTP", error: error.message });
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
        cb(null, './public/uploads');
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
            if (!req?.file) {
                return res.status(200).json({ message: "Only specific image file types (JPEG, PNG, GIF, SVG) are allowed!  " });
            }

            const fileType = req.file.mimetype;
            const fileName = req.file.filename;
            const fileURL = `${fileName}`;

            res.status(200).json({ message: "Image Uploaded to Server", url: fileURL })
        });
    } catch (error) {
        res.status(400).json({ message: "Error Uploading User Profile" })
    }
}

// Update User Profile
const addUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, image, email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Enter Email" });
        }


        const existingUser = await userModel.findOne({ email: email });

        if (!existingUser) {
            return res.status(404).json({ message: "User not Exist" });
        }

        if (name) {
            existingUser.name = name;
        }
        if (image) {
            existingUser.profileImage = image;
        }
        if (email) {
            existingUser.email = email;
        }

        const updatedUser = await existingUser.save();

        res.status(200).json({ message: "User Profile updated", data: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Error updating user profile", error: error.message });
    }
}

// Add to wishlist
const addToWishlist = async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;

        if (!id || !email) {
            return res.status(400).json({ message: "Please provide both ID and Email" });
        }

        const findUser = await userModel.findOne({ email });

        if (!findUser) {
            return res.status(400).json({ message: "User with this email is not registered" });
        }

        const findProduct = await Product.findOne({ _id: id });

        if (!findProduct) {
            return res.status(400).json({ message: "Product not found" });
        }

        if (!findUser.wishlist) {
            findUser.wishlist = [];
        }

        if (findUser.wishlist.includes(id)) {
            return res.status(400).json({ message: "Product is already in the wishlist" });
        }

        findUser.wishlist.push(id);
        await findUser.save();

        res.status(200).json({ message: "Product added to wishlist", product: findProduct });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Error adding to wishlist" });
    }
};

// Delete Item from wishlist
const deleteWishlist = async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;

        if (!id || !email) {
            return res.status(400).json({ message: "Please provide both ID and Email" });
        }

        const findUser = await userModel.findOne({ email });

        if (!findUser) {
            return res.status(400).json({ message: "User with this email is not registered" });
        }

        const findProduct = await Product.findOne({ _id: id });

        if (!findProduct) {
            return res.status(400).json({ message: "Product not found" });
        }

        if (!findUser.wishlist) {
            findUser.wishlist = [];
        }

        if (findUser.wishlist.includes(id)) {
            findUser.wishlist = null;
            await findUser.save();
            res.status(200).json({ message: "Product Deleted from wishlist", product: findProduct });
        } else {
            return res.status(400).json({ message: "Product not exist in wishlist" })
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Error deleting from wishlist" });
    }
};

// Get all items from wishlist
const getAllWishlist = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Enter id" })
        }

        const findUser = await userModel.findOne({ _id: id });
        if (!findUser) {
            return res.status(400).json({ message: "id not registered" });
        }
        const wishlist = findUser.wishlist;
        res.status(200).json({ message: "Wishlist", wishlist: wishlist })
    }
    catch (error) {
        res.status(400).json({ message: "Error Getting Wishlist" })
    }
}

// Add User Addresses
const addAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const { addresses } = req.body;
        if (!id) {
            return res.status(400).json({ message: "Enter ID" })
        }
        if (!addresses) {
            return res.status(400).json({ message: "Enter Address" })
        }
        const findUser = await userModel.findOne({ _id: id });
        if (!findUser) {
            return res.status(400).json({ message: "User Not Exist" })
        }

        findUser.addresses = addresses;
        await findUser.save();
        res.status(200).json({ message: "Address Added", Address: addresses })
    } catch (error) {
        res.status(400).json({ message: "Error Adding Addresses" })
    }
}

// Get All User Addresses
const readAddresses = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Enter ID" })
        }
        const findUser = await userModel.findOne({ _id: id });
        if (!findUser) {
            return res.status(400).json({ message: "User Doesn't Exist" })
        }

        const data = findUser.addresses;
        res.status(200).json({ Addresses: data })
    } catch (error) {
        res.status(400).json({ message: "Error Reading Addresses" })
    }
}

// Update User Addresses
const updateUserAddresses = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Enter ID" });
        }
        const { addresses } = req.body;
        if (!addresses) {
            return res.status(400).json({ message: "Enter Address" })
        }
        const findUser = await userModel.findOneAndUpdate({ _id: id }, {
            addresses
        });

        if (!findUser) {
            return res.status(400).json({ message: "User Not Registered" });
        }

        const data = await userModel.findOne({ _id: id });


        res.status(400).json({ message: "User Addresses Updated", Addresses: data.addresses })

    } catch (error) {
        res.status(400).json({ message: "Error Updating Addresses" })
    }
}

// Get New Arrivals : New Products (Less than 30 Days)
const newArrivals = async (req, res) => {
    try {
        const daysAgo = new Date(new Date().setDate(new Date().getDate() - 30));
        const newArrivals = await Product.find({ date: { $gte: daysAgo } }).exec();
        res.status(200).json({ message: "New Arrivals Found", NewArrivals: newArrivals })
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error Getting New Arrivals' });
    }
};

// Update User Cart :item
const updateCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, quantity } = req.body;
        if (quantity <= 0) {
            return res.status(400).json({ error: 'Invalid quantity' });
        }
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.cart) {
            user.cart = [];
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }


        const cartItem = user.cart.find((item) => item.productID.toString() === id);

        if (cartItem) {
            cartItem.quantity += quantity;
        } else {
            user.cart.push({ productID: product._id, quantity });
        }
        if (user.cart[0] > product.quantity) {
            return res.status(400).json({ error: 'This Quantity is not available in stock' });
        }

        await user.save();

        return res.status(200).json({ message: 'Product added to cart', Cart: user.cart });
    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete item from cart
const deleteCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body
        if (!id || !email) {
            return res.status(400).json({ message: "Enter All Fields" })
        }
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const cartItemIndex = user.cart.findIndex((item) => item.productID.toString() === id);

        if (cartItemIndex === -1) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }

        user.cart.splice(cartItemIndex, 1);
        await user.save();

        return res.status(200).json({ message: 'Cart item deleted', Cart: user.cart });
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Add item to cart
const addToCart = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, email } = req.body;
        if (!email || !quantity) {
            return res.status(400).json({ message: "Enter All Fields" })
        }
        if (quantity <= 0) {
            return res.status(400).json({ error: 'Invalid quantity' });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const cartItem = user.cart.find((item) => item.productID.toString() === id);

        if (!cartItem) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }

        const product = await Product.findById(cartItem.productID);

        if (product.quantity < quantity) {
            return res.status(400).json({ error: 'This Quantity is not available in stock' });
        }

        cartItem.quantity = quantity;
        await user.save();

        return res.status(200).json({ message: 'Cart item quantity updated', Cart: user.cart });
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const validateCoupon = async (req, res) => {
    try {
        const enteredCouponCode = req.body.code;
        if (!enteredCouponCode) {
            return res.status(400).json({ message: "Enter Coupon Code" });
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Enter ID" })
        }
        const findProduct = await Product.findOne({ _id: id });
        if (!findProduct) {
            return res.status(400).json({ message: "Product Not found" })
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
        res.status(400).json({ message: "Invalid / Expired Coupon" })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error validating product coupon" });
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
    getAllWishlist,
    addAddress,
    readAddresses,
    updateUserAddresses,
    newArrivals,
    addToCart,
    deleteCartItem,
    updateCartItem,
    validateCoupon,
};

