import { Request, Response } from 'express';
import Credit from '../models/credit';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

export const purchaseCredits = async (req: Request, res: Response) => {
  const { userId, credits, paymentMethodId } = req.body;

  if (!userId || !credits || !paymentMethodId) {
    return res.status(400).send('User ID, credits, and payment method are required');
  }

  try {
    // Create a PaymentIntent and confirm it
    const paymentIntent = await stripe.paymentIntents.create({
        amount: credits * 100, // Assuming 1 credit = $1
        currency: 'usd',
        payment_method: paymentMethodId,
        confirm: true,
        return_url: "http://localhost:3000/credits"
    });

    // Check if payment was successful
    if (paymentIntent.status !== 'succeeded') {
        throw new Error('Payment failed');
    }

    // Create and save the credit record if payment is successful
    const newCredit = new Credit({ userId, credits });
    await newCredit.save();
    res.status(201).send(newCredit);
} catch (err) {
    // Log the error for debugging purposes
    console.error('Error processing payment or saving credit:', err);
    res.status(500).send('Server error');
}

};
