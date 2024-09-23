import { Request, Response } from 'express';
import Stripe from 'stripe';
import Credit from '../models/credit';
import dotenv from 'dotenv';

import { publishCreditAdded } from '../utils/rabbitmq';

dotenv.config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2024-06-20' });


export const purchaseCredits = async (req: Request, res: Response) => {
  const { userId, credits, paymentMethodId } = req.body;

  if (!userId || !credits || !paymentMethodId) {
    return res.status(400).json({ error: 'User ID, credits, and payment method are required' });
  }

  console.log(`Processing purchase for user ${userId}, credits: ${credits}, paymentMethodId: ${paymentMethodId}`);
  try{
  const paymentAmount = credits * 100; // Assuming 1 credit = $1
  const paymentIntent = await stripe.paymentIntents.create({
          amount: paymentAmount,
          currency: 'usd',
          payment_method: paymentMethodId,
          confirm: true,
          return_url: 'http://localhost:3000/credits'
  });

  if (paymentIntent.status === 'requires_action') {
    return res.send({
        requiresAction: true,
        clientSecret: paymentIntent.client_secret,
    });
} else if (paymentIntent.status === 'succeeded') {
    await publishCreditAdded(userId, credits);
    res.json({ status: 'success', message: 'Credits addition initiated' });
} else {
    res.status(500).json({ error: 'Unexpected payment status' });
}

    
      const creditRecord = await Credit.findOneAndUpdate(
      { userId },
      { $inc: { credits } },
      { new: true, upsert: true }
    );

    console.log(`Credits updated for user ${userId}: ${creditRecord.credits}`);
  } catch (err) {
    console.error('Error processing purchase:', err);
    throw err; // Rethrow to handle acknowledgment
  }
};

export const getCredits = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const creditRecord = await Credit.findOne({ userId });

    if (!creditRecord) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ credits: creditRecord.credits });
  } catch (err: any) {
    console.error('Error fetching credits:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

export const reduceCredits = async (req: Request, res: Response) => {
  const { userId } = req.body;

  try {
    const userCredit = await Credit.findOne({ userId });

    if (!userCredit) {
      return res.status(404).json({ message: "User not found" });
    }

    userCredit.credits = Math.max(0, userCredit.credits - 1); // Prevent negative credits
    await userCredit.save();

    res.status(200).json({ message: "Credits updated successfully", credits: userCredit.credits });
  } catch (error) {
    res.status(500).json({ error: "Failed to update credits" });
  }
};