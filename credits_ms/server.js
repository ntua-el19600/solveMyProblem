const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const creditRoutes = require('./src/routes/creditRoutes');

dotenv.config({ path: '.env.local' });

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log(err));

app.use('/api/credits', creditRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
