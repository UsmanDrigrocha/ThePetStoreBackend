const OTP = require('../models/otpModel');
const userModel = require('../models/userModel');

const moment = require('moment-timezone');

const mail = require('../utils/sendMail');



// Generate OTP
const generateOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: "Enter Email !!!" });
        } else {
            const user = await userModel.findOne({ email: email });
            if (user) {
                const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

                const createdAtDateTime = new Date();
                const expiredAtDateTime = new Date(createdAtDateTime.getTime() + 90000);

                const otp = new OTP({
                    user: user.id,
                    otp: otpCode,
                    createdAt: createdAtDateTime,
                    expiresAt: expiredAtDateTime,
                });

                await otp.save();
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
        res.status(400).json({ message: "Error in generating otp", error: error.message });
    }
};



// Verify OTP
const verifyOTP = async (req, res) => {
    try {
        const { userId, enteredOTP } = req.body;

        if (!userId || !enteredOTP) {
            return res.status(400).json({ message: "User ID and OTP are required." });
        }

        const otp = await OTP.findOne({ user: userId, otp: enteredOTP });
        // console.log(otp.user); // user ID

        if (otp) {
            const currentTime = new Date();
            if (otp.expiresAt >= currentTime) {
                res.status(200).json({ message: "OTP Verified Successfully" });
            } else {
                res.status(400).json({ message: "OTP has expired." });
            }
        } else {
            res.status(400).json({ message: "Invalid OTP." });
        }
    } catch (error) {
        res.status(400).json({ message: "Error in verifying OTP", error: error.message });
    }
};




module.exports = {
    generateOTP,
    verifyOTP,
};
