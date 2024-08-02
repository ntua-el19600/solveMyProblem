import amqp from 'amqplib';
import Stripe from 'stripe';
import Credit from '../models/credit';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2024-06-20' });

const processPurchase = async (msg: amqp.Message) => {
  const { userId, credits, paymentMethodId } = JSON.parse(msg.content.toString());

  try {
    // Create a PaymentIntent and confirm it
    const paymentIntent = await stripe.paymentIntents.create({
      amount: credits * 100, // Assuming 1 credit = $1
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
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
        upsert: true, // Create the document if it does not exist
      }
    );

    console.log(`Credits updated for user ${userId}: ${creditRecord.credits}`);
  } catch (err) {
    console.error('Error processing purchase:', err);
  }
};

const startWorker = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL as string);
  const channel = await connection.createChannel();
  await channel.assertQueue('credit_purchases', { durable: true });

  channel.consume('credit_purchases', async (msg) => {
    if (msg !== null) {
      await processPurchase(msg);
      channel.ack(msg);
    }
  }, { noAck: false });

  console.log('Credit worker started');
};

startWorker().catch(console.error);
