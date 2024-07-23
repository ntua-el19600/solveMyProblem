const express = require('express');
const { buyCredits } = require('../controllers/creditController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/buy', authMiddleware, buyCredits);

module.exports = router;
