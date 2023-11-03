const session = require('express-session');
const express = require('express');
const app = express();
const cors = require('cors')
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes')
require('dotenv').config();
const path = require('path');

require('./config/db')

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({extended : true}))

app.use(
  session({
    secret: process.env.JWT_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 }, // 1 hour
  })
);

app.use('/', express.static(path.join(__dirname, 'public/uploads')));

app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

const port = process.env.PORT;

app.listen(port, () => {
  console.log("Server Working Properly");
});

app.get('/', (req, res) => {
  res.status(200).json({ message: "Server Working Properly", project: "ThePetStore Backend" });
});


// --Firebase
// var admin = require("firebase-admin");

// var serviceAccount = require("./config/service-account/the-pet-store-928bf-firebase-adminsdk-2wk4q-f2aa5302d6.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });
