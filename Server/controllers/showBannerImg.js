const bannerModel = require('../models/bannerModel');

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

module.exports = {
    showBannerImg,
};
