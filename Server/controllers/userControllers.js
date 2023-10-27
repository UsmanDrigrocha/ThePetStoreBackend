const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();
const mail = require('../utils/sendMail');
const session = require('express-session');
const bannerModel = require('../models/bannerModel');
const multer = require('multer');
const path = require('path')


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
                        profileImage: null
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

        // Check if the fields are provided and update only if they exist in the request
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

        res.status(200).json({ message: "Category updated", data: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Error updating category", error: error.message });
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
};

