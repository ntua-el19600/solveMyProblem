import amqp, { Connection, Channel, ConsumeMessage } from "amqplib";
import { solveLinearProblem } from "../utilities/linear";
import { solveVrpProblem } from "../utilities/vrp";

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
              const result = await solveLinearProblem(problem_data);
              console.log("Solution:", result.solution);
              console.log("Elapsed Time:", result.elapsedTime, "ms");
              channel.ack(msg);
            } else if (message.category === "vrp") {
              const problem_data_vrp = JSON.stringify(problem_data.locations);
              const final = JSON.parse(problem_data_vrp);
              const arg2 = problem_data.num_vehicles;
              const arg3 = problem_data.depot;
              const arg4 = problem_data.max_distance;
              const result = await solveVrpProblem(final, arg2, arg3, arg4);
              console.log("Solution:", result.solution);
              console.log("Elapsed Time:", result.elapsedTime, "ms");
              channel.ack(msg);
            } else {
              throw new Error("Unknown category");
            }
          } catch (error) {
            console.error("Error processing message:");
            // Optionally, you can nack the message to requeue it or move it to a dead-letter queue
            channel.ack(msg);
          }
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
