const session = require('express-session');
const express = require('express');
const app = express();
const cors = require('cors')
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes')
require('dotenv').config();

require('./config/db')

app.use(express.json());
app.use(cors());

app.use(
  session({
    secret: process.env.JWT_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 }, // 1 hour
  })
);


app.use('public/uploads', express.static('uploads')); // For Image Upload

app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

const port = process.env.PORT;

app.listen(port, () => {
  console.log("Server Working Properly");
});

app.get('/', (req, res) => {
  res.status(200).json({ message: "Server Working Properly", project: "ThePetStore Backend" });
});
