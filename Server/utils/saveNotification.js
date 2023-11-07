const Notification = require('../models/User/notification')

async function saveNotificaton(newOffer) {
    try {
        const newNotification = await Notification({
            offerID:newOffer
        })
        newNotification.save();
    } catch (error) {
        console.log('Error Saving Notifications ...', error.message)
    }
};

module.exports = saveNotificaton;