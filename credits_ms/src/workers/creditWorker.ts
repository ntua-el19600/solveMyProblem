import amqp from 'amqplib';
import Stripe from 'stripe';
import Credit from '../models/credit';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2024-06-20' });

const processPurchase = async (msg: amqp.Message) => {
  try {
    const messageContent = msg.content.toString();
    console.log('Received message:', messageContent);
    
    const { userId, credits, paymentMethodId } = JSON.parse(messageContent);
    
    if (!userId || !credits || !paymentMethodId) {
      throw new Error('Invalid message format: Missing userId, credits, or paymentMethodId');
    }

    console.log(`Processing purchase for user ${userId}, credits: ${credits}, paymentMethodId: ${paymentMethodId}`);

    const paymentAmount = credits * 100; // Assuming 1 credit = $1
    const paymentIntent = await stripe.paymentIntents.create({
      amount: paymentAmount,
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
    });

    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment failed: PaymentIntent status is not succeeded');
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

const startWorker = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL as string);
    console.log('Connected to RabbitMQ');
    const channel = await connection.createChannel();
    
    await channel.assertQueue('credit_purchases', { durable: true });
    console.log('Queue asserted');

    channel.consume('credit_purchases', async (msg) => {
      if (msg !== null) {
        try {
          console.log('Message received:', msg.content.toString());
          await processPurchase(msg);
          channel.ack(msg); // Acknowledge the message
          console.log('Message acknowledged');
        } catch (err) {
          console.error('Error during message processing:', err);
          channel.nack(msg); // Reject the message and requeue
        }
      } else {
        console.log('Received null message');
      }
    }, { noAck: false });

    console.log('Credit worker started and waiting for messages...');
  } catch (err) {
    console.error('Error starting worker:', err instanceof Error ? err.message : err);
  }
};

startWorker().catch(console.error);
