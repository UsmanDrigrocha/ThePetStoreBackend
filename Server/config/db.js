const mongoose = require('mongoose');
require('dotenv').config();


const dbVar = process.env.DB_VAR;

mongoose.connect(dbVar).then(() => {
    console.log('DB Connected');
}).catch((err) => {
    // console.error('DB Connection Error:', err);
    console.error('DB Connection Error : ');
});

module.exports = mongoose.connection; //DB is connecting without it ;)