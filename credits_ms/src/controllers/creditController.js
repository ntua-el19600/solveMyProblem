const Credit = require('../models/credit');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.purchaseCredits = async (req, res) => {
    const { userId, credits, paymentMethodId } = req.body;

    if (!userId || !credits || !paymentMethodId) {
        return res.status(400).send('User ID, credits, and payment method are required');
    }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: credits, // Assuming 1 credit = $1
            currency: 'eur',
            payment_method: paymentMethodId,
            confirm: true,
        });

        const newCredit = new Credit({ userId, credits });
        await newCredit.save();
        res.status(201).send(newCredit);
    } catch (err) {
        res.status(500).send('Server error');
    }
};
