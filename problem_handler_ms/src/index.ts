import mongoose from "mongoose";
import { DatabaseConnectionError } from "./errors/database-connection-error";
import { closeConnection, setupRabbitMQ } from "./rabbitmq/rabbitmq";

import { app } from "./app";

const PORT = process.env.PORT || 3002;

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);

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

  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
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
