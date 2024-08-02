import { Request, Response } from 'express';
import Credit from '../models/credit';
import { publishToQueue } from '../utils/rabbitmq';

export const purchaseCredits = async (req: Request, res: Response) => {
  const { userId, credits, paymentMethodId } = req.body;

  if (!userId || !credits || !paymentMethodId) {
    return res.status(400).json({ error: 'User ID, credits, and payment method are required' });
  }

  try {
    // Publish the purchase request to RabbitMQ
    const message = JSON.stringify({ userId, credits, paymentMethodId });
    await publishToQueue('credit_purchases', message);

    res.status(201).json({ message: 'Purchase request received' });
  } catch (err) {
    console.error('Error publishing message to RabbitMQ:', err);
    res.status(500).json({ error: 'Server error' });
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