import amqp, { Connection, Channel, ConsumeMessage } from "amqplib";
import { Problem } from "../models/problem";
import mongoose from "mongoose";
import { probStatus } from "../models/problem";
let connection: Connection;
let channel: Channel;
import axios from "axios"; 

const deductUserCredits = async (userId: String) => {
  try {
    const response = await axios.post("http://credits:3001/api/credits/reduce", {
      userId: userId, // Include user ID or other necessary data
    });

    console.log(`Credits deducted for user ${userId}: ${response.data}`);
  } catch (error) {
    console.log(`Failed to deduct credits for user ${userId}:`);
  }
};




export const setupRabbitMQ = async () => {
  try {
    // Connect to RabbitMQ
    connection = await amqp.connect("amqp://rabbitmq:5672/");
    channel = await connection.createChannel();

    // Declare first exchange and queue for problem processing
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

    // Declare new exchange and queue for solution processing
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

    console.log("RabbitMQ setup completed successfully.");

    // Set up a consumer for the new queue (solution_queue)
    await channel.consume(newQueue, async (msg: ConsumeMessage | null) => {
      if (msg !== null) {
        try {
          const messageContent = msg.content.toString();
          console.log(
            `Received message from solution_queue: ${messageContent}`
          );
          const { id, solution, elapsedTime, userId } = JSON.parse(messageContent);
          if (solution === "none") {
            var statusx = probStatus.Cancelled;
          } else {
            var statusx = probStatus.Complete;
            await deductUserCredits(userId);
          }

          const result = await Problem.updateOne(
            { _id: id },
            {
              $set: {
                solution: solution,
                timelapse: elapsedTime,
                status: statusx,
              },
            }
          );
          if (result.matchedCount > 0) {
            console.log(`Problem with ID ${id} updated successfully.`);
          } else {
            console.log(`No problem found with ID ${id}.`);
          }

          // Acknowledge the message to remove it from the queue
          channel.ack(msg);
        } catch (err) {
          console.log(err);
          channel.nack(msg);
        }
      }
    });
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
