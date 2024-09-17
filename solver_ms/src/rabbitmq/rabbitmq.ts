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

    const newExchange = "solution_exchange";
    const newQueue = "solution_queue";
    const newRoutingKey = "solution_routing_key";

    await channel.assertExchange(newExchange, "direct", {
      durable: true,
    });

    await channel.assertQueue(newQueue, {
      durable: true,
    });

    await channel.bindQueue(newQueue, newExchange, newRoutingKey);

    console.log("RabbitMQ listener setup completed successfully.");

    await channel.consume(
      queue,
      async (msg: ConsumeMessage | null) => {
        if (msg) {
          const messageContent = msg.content.toString();
          console.log("Message received:", messageContent);

          try {
            var message = JSON.parse(messageContent);

            const problem = JSON.stringify(message.problem_data);
            const problem_data = JSON.parse(problem);

            // Determine the route based on the category
            let route;
            if (message.category === "linear") {
              const result = await solveLinearProblem(problem_data);
              console.log("Solution:", result.solution);
              console.log("Elapsed Time:", result.elapsedTime, "ms");
              const mynhma = {
                solution: result.solution,
                elapsedTime: result.elapsedTime,
                id: message.id,
              };
              const myn = JSON.stringify(mynhma);

              await publishToQueue(myn);
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
              const mynhma = {
                solution: result.solution,
                elapsedTime: result.elapsedTime,
                id: message.id,
              };
              const myn = JSON.stringify(mynhma);
              await publishToQueue(myn);
              channel.ack(msg);
            } else {
              throw new Error("Unknown category");
            }
          } catch (error) {
            console.error("Error processing message:");
            const mynhma = {
              solution: "none",
              elapsedTime: 0,
              id: message.id,
            };
            const myn = JSON.stringify(mynhma);
            await publishToQueue(myn);
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
export const publishToQueue = async (message: string) => {
  try {
    const exchange = "solution_exchange";
    const routingKey = "solution_routing_key";
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
    console.log("RabbitMQ listener connection closed.");
  } catch (error) {
    console.error("Error closing RabbitMQ listener connection:", error);
  }
};
