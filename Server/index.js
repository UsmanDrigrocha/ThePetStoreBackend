const express = require('express');
const app = express();
const cors = require('cors')
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();

require('./config/db')

app.use(express.json());
app.use(cors());

app.use('/uploads', express.static('uploads')); // For Image Upload

app.use('/api/user', userRoutes);

const port = process.env.PORT;

app.listen(port, () => {
    console.log("Server Working Properly");
});

app.get('/', (req, res) => {
    res.status(200).json({ message: "Server Working Properly", project: "ThePetStore Backend" });
});
