import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

let channel: amqp.Channel;

const connectRabbitMQ = async (retries = 5) => {
  while (retries > 0) {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URL as string);
      channel = await connection.createChannel();
      const exchangeName = 'credit_exchange';
      const queueName = 'credit_purchases';

      // Declare the exchange
      await channel.assertExchange(exchangeName, 'direct', { durable: true });
      
      // Declare the queue and bind it to the exchange
      await channel.assertQueue(queueName, { durable: true });
      await channel.bindQueue(queueName, exchangeName, queueName);
      return channel;
    } catch (error) {
      console.error(`Failed to connect to RabbitMQ, retries left: ${retries - 1}`, error);
      retries -= 1;
      await new Promise(res => setTimeout(res, 5000)); // wait for 5 seconds before retrying
    }
  }
  console.error('All retries to connect to RabbitMQ failed');
  process.exit(1); // Exit the process if all retries fail
};

const publishToExchange = async (exchange: string, routingKey: string, message: string) => {
  if (!channel) {
    console.error('Cannot send message, channel is not initialized');
    return;
  }

  try {
    await channel.publish(exchange, routingKey, Buffer.from(message), { persistent: true });
    console.log(`Message sent to exchange ${exchange} with routing key ${routingKey}`);
  } catch (error) {
    console.error('Failed to send message to exchange', error);
  }
};

export { connectRabbitMQ, publishToExchange };
