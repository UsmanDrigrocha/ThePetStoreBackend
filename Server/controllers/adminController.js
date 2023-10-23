const bannerModel = require('../models/bannerModel');
const registedUsersModel = require('../models/userModel');

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



const createCategory = async (req, res) => {
try {
    res.status(200).json({message:"Catagory Created"});
} catch (error) {
    res.status(400).json({message:"Error in Creating Category",error:error.message})
}
}





module.exports = {
    showRegistedUsers,
    showBannerImg,
    createCategory
};