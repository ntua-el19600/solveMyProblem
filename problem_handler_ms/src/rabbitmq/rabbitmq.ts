import amqp, { Connection, Channel, ConsumeMessage } from "amqplib";

let connection: Connection;
let channel: Channel;

export const setupRabbitMQ = async () => {
  try {
    connection = await amqp.connect("amqp://guest:guest@localhost:5672/");
    channel = await connection.createChannel();

    const exchange = "problem_exchange";
    const queue = "problem_queue";
    const routingKey = "problem_routing_key";

    await channel.assertExchange(exchange, "direct", {
      durable: true,
    });

    await channel.assertQueue(queue, {
      durable: true,
    });

    await channel.bindQueue(queue, exchange, routingKey);

    console.log("RabbitMQ setup completed successfully.");
  } catch (error) {
    console.error("Error setting up RabbitMQ:", error);
  }
};

export const publishToQueue = async (message: string) => {
  try {
    const exchange = "problem_exchange";
    const routingKey = "problem_routing_key";

    await channel.publish(exchange, routingKey, Buffer.from(message));

    console.log("Message published:", message);
  } catch (error) {
    console.error("Error publishing message:", error);
  }
};

export const closeConnection = async () => {
  try {
    if (channel) {
      await channel.close();
    }
    if (connection) {
      await connection.close();
    }
    console.log("RabbitMQ connection closed.");
  } catch (error) {
    console.error("Error closing RabbitMQ connection:", error);
  }
};
