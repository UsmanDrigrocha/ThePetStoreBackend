const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
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
  password: { type: String, required: true },
});


module.exports = mongoose.model('registeredUsers', userSchema);