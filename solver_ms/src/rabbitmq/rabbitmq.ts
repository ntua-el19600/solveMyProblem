import amqp, { Connection, Channel, ConsumeMessage } from "amqplib";
import { solveLinearProblem } from "../utilities/linear";

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
      async (msg: ConsumeMessage | null) => {
        if (msg) {
          const messageContent = msg.content.toString();
          console.log("Message received:", messageContent);

          try {
            const message = JSON.parse(messageContent);
            
            const problem = JSON.stringify(message.problem_data);
            const problem_data = JSON.parse(problem);


            // Determine the route based on the category
            let route;
            if (message.category === "linear") {
              route = "/api/solver/solvelinear";
            } else if (message.category === "vrp") {
              route = "/api/solver/solvevrp";
            } else {
              throw new Error("Unknown category");
            }

            const result = await solveLinearProblem(problem_data);
            console.log('Solution:', result.solution);
            console.log('Elapsed Time:', result.elapsedTime, 'ms');
            channel.ack(msg);
          } catch (error) {
            console.error("Error processing message:");
            // Optionally, you can nack the message to requeue it or move it to a dead-letter queue
            channel.ack(msg);
          }
        }
      },
      { noAck: false}
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

