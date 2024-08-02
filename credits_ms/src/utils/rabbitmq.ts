import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

let channel: amqp.Channel;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL as string);
    channel = await connection.createChannel();
    await channel.assertQueue('credit_purchases', { durable: true });
    console.log('Connected to RabbitMQ');
  } catch (error) {
    console.error('Failed to connect to RabbitMQ', error);
  }
};

const publishToQueue = async (queue: string, message: string) => {
  try {
    await channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
    console.log(`Message sent to queue ${queue}`);
  } catch (error) {
    console.error('Failed to send message to queue', error);
  }
};

export { connectRabbitMQ, publishToQueue };
