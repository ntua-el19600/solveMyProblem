const User = require('../models/userModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const buyCredits = async (req, res) => {
  const { amount, paymentMethodId } = req.body;
  const { userId } = req.auth;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid amount' });
  }

  try {
    // Process the payment
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to smallest currency unit
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
    });

    let user = await User.findOne({ clerkId: userId });
    if (!user) {
      user = new User({ clerkId: userId });
    }

    user.credits += amount;
    await user.save();

    return res.status(200).json({ message: 'Credits purchased successfully', credits: user.credits });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = { buyCredits };
