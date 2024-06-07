const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');

dotenv.config();

const app = express();
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected for Auth Service'))
  .catch(err => console.log(err));

const authRoutes = require('./routes/authRoutes');

app.use(ClerkExpressWithAuth({ clerkApiKey: process.env.CLERK_API_KEY }));
app.use('/auth', authRoutes);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Auth service running on port ${port}`);
});
