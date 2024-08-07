import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

let channel: amqp.Channel;

export const setupRabbitMQ = async () => {
  try {
    const rabbitMqUrl = process.env.RABBITMQ_URL;
    if (!rabbitMqUrl) {
      throw new Error("RABBITMQ_URL environment variable is not set");
    }

    const connection = await amqp.connect(rabbitMqUrl);
    channel = await connection.createChannel();

    const exchange = process.env.CREDITS_EXCHANGE_NAME;
    if (!exchange) {
      throw new Error("CREDITS_EXCHANGE_NAME environment variable is not set");
    }
    await channel.assertExchange(exchange, 'direct', { durable: true });

    console.log('RabbitMQ correctly connected');
  } catch (error) {
    console.error("Failed to connect to RabbitMQ:", error);
    setTimeout(setupRabbitMQ, 5000); // Retry connection
  }
};

export const publishCreditAdded = async (userId: string, amount: number) => {
  const exchange = process.env.CREDITS_EXCHANGE_NAME;
  const routingKey = process.env.CREDITS_ADDED_ROUTING_KEY;
  const usersRoutingKey = process.env.USER_CREDITS_ROUTING_KEY;

  if (!exchange) {
    throw new Error("CREDITS_EXCHANGE_NAME environment variable is not set");
  }
  if (!routingKey) {
    throw new Error("CREDITS_ADDED_ROUTING_KEY environment variable is not set");
  }
  if (!usersRoutingKey) {
    throw new Error("USER_CREDITS_ROUTING_KEY environment variable is not set");
  }

  const msg = JSON.stringify({
    action: 'update',
    data: { userID: userId, creditsChange: amount }
  });

  channel.publish(exchange, routingKey, Buffer.from(msg), { persistent: true });
  channel.publish(exchange, usersRoutingKey, Buffer.from(msg), { persistent: true });
  console.log(`Credit addition message published for user ${userId}`);
};


