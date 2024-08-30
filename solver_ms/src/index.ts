import { app } from "./app";
import { setupRabbitMQListener,closeConnection } from "./rabbitmq/rabbitmq";

const start = async () => {

  try {
    await setupRabbitMQListener();
    console.log("Connected to rabbitmq");
  } catch (err) {
    console.log("cant connect to rabbitmq");
  }
  app.listen(3003, () => {
    console.log("Listening on port 3003!!!!!!!!");
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
