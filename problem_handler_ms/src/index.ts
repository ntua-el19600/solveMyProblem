import mongoose from "mongoose";
import { DatabaseConnectionError } from "./errors/database-connection-error";
import { closeConnection, setupRabbitMQ } from "./rabbitmq/rabbitmq";

import { app } from "./app";

const start = async () => {
  try {
    await mongoose.connect("mongodb://localhost:2001");

    console.log("Connected to MongoDb");
  } catch (err) {
    console.log(new DatabaseConnectionError());
  }
  try {
    await setupRabbitMQ();
    console.log("Connected to rabbitmq");
  } catch (err) {
    console.log("cant connect to rabbitmq");
  }

  app.listen(3004, () => {
    console.log("Listening on port 3004!!!!!!!!");
  });
};

process.on("SIGTERM", async () => {
  await closeConnection();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await closeConnection();
  process.exit(0);
});

start();
