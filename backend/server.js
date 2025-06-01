const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const taskRoutes = require('./routes/tasks');
// const categoryRoutes = require('./routes/categories');
const userRoutes = require('./routes/users');
const {join} = require("node:path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('MongoDB error:', err));

app.use('/tasks', taskRoutes);
// app.use('/categories', categoryRoutes);
app.use('/users', userRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static(join(__dirname, 'uploads')));

app.listen(process.env.PORT, () => {
    console.log(`✅ Server running on http://localhost:${process.env.PORT}`);
});
