const mongoose = require('mongoose');

const CreditSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    credits: { type: Number, required: true },
    purchaseDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Credit', CreditSchema);
