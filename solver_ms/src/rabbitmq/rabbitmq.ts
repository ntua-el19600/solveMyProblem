import amqp, { Connection, Channel, ConsumeMessage } from "amqplib";

let connection: Connection;
let channel: Channel;

export const setupRabbitMQListener = async () => {
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

    console.log("RabbitMQ listener setup completed successfully.");

    await channel.consume(
      queue,
      (msg: ConsumeMessage | null) => {
        if (msg) {
          const messageContent = msg.content.toString();
          console.log("Message received:", messageContent);

          
          channel.ack(msg);
        }
      },
      { noAck: false }
    );

  } catch (error) {
    console.error("Error setting up RabbitMQ listener:", error);
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
    console.log("RabbitMQ listener connection closed.");
  } catch (error) {
    console.error("Error closing RabbitMQ listener connection:", error);
  }
};
