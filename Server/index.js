const session = require('express-session');
const express = require('express');
const app = express();
const cors = require('cors')
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes')
require('dotenv').config();
const path = require('path');
const {emailModel}=require('./models/user/email')

require('./config/db')

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }))

app.use(
  session({
    secret: process.env.JWT_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 }, // 1 hour
  })
);

app.use('/', express.static(path.join(__dirname, 'uploads')));

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

// # First RUN : ' cd swagger ; node swagger.js -- then it generate swagger-output.json file ; then run server '
const swaggerUi=require('swagger-ui-express')
const swaggerDocument = require('./swagger/swagger-output.json')

app.use('/api-docs',swaggerUi.serve,swaggerUi.setup(swaggerDocument));


// Experiment

// Save Email !
app.post('/api/email_list/post', async (req, res) => {
  try {
      const { email } = req.body;
      if (!email) {
          return res.status(400).json({ Message: "Enter Email !" });
      }
      if (!(email.includes('@') && !email.includes(' '))) {
          return res.status(400).json({ Message: "Enter Valid Email !" })
      }
      const findEmail = await emailModel.findOne({ email });
      if (findEmail) {
          return res.status(400).json({ Message: "Email already exist !" });
      }
      const newEmail = new emailModel({
          email
      })
      await newEmail.save();
      res.status(201).json({ Message: "Email Saved to DB !", Email: newEmail });
  } catch (error) {
      res.status(500).json({ Message: "Error Adding Email to list !" });
  }
})



// Save Email !
app.post('/api/email_list/get', async (req, res) => {
  try {
      const { name } = req.body;
      if (!name) {
          return res.status(400).json({ Message: "Enter secret key !" });
      }
      if (name === "ZURAS_ONLINE") {
          const email_list = await emailModel.find({});
          return res.status(200).json({ Message: "Email list", Email_List: email_list })
      } else {
          return res.status(401).json({ Message: "Unauthorized !" });
      }
  } catch (error) {
      res.status(500).json({ Message: "Error Getting Email list !" });
  }
})
