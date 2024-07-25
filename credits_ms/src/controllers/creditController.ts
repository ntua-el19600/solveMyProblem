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

    // Find or create a Credit record for the user, updating the credits
    const creditRecord = await Credit.findOneAndUpdate(
      { userId },
      { $inc: { credits } },
      {
        new: true, // Return the updated document
        upsert: true // Create the document if it does not exist
      }
    );

    res.status(201).send({ message: 'Credits purchased successfully', credits: creditRecord.credits });
  } catch (err) {
    // Log the error for debugging purposes
    console.error('Error processing payment or saving credit:', err);
    res.status(500).send('Server error');
  }
};
