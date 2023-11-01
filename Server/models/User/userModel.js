const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: {
    type: String,
    unique: true,
    // validate: {
    //   validator: async function (value) {
    //     const existingUser = await this.constructor.findOne({ email: value });
    //     return !existingUser;
    //   },
    //   message: 'Email must be unique - enter unique.',
    // },
    // description: 'The email address of the user.',
  },
  password: { type: String },
  otp: String,
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date,
  isDeleted: { type: Boolean, default: false },
  // profileImage: { type: String },
  // wishlist: {
  //   type: [String],
  //   default: null
  // },
  // addresses: {
  //   type: [String],
  //   default: null
  // },
    //   cart: [{
    //     productID: {
    //         type: mongoose.Schema.Types.ObjectID,
    //         ref: 'Product',
    //     },
    //     quantity: {
    //         type: Number,
    //         default: 1,
    //     }
    // }]
});


module.exports = mongoose.model('registeredUsers', userSchema);