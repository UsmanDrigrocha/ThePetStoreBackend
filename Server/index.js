const express = require('express');
const app = express();
const cors = require('cors')
app.use(cors());

const session = require('express-session');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes')
require('dotenv').config();
const path = require('path');
const {emailModel}=require('./models/user/email')

require('./config/db')

app.use(express.json());
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
  console.log("Server Working Properly" , port);
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

