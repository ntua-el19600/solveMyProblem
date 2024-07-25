const express = require('express');
const router = express.Router();
const creditController = require('../controllers/creditController');
const { ClerkExpressMiddleware, requireSession } = require('@clerk/clerk-sdk-node');

router.use(ClerkExpressMiddleware());
router.use(requireSession());

router.post('/purchase', creditController.purchaseCredits);

module.exports = router;
