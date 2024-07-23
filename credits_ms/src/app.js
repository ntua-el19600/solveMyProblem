const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const creditRoutes = require('./routes/creditRoutes');

require('dotenv').config();

const app = express();

app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use('/credits', creditRoutes);

module.exports = app;
