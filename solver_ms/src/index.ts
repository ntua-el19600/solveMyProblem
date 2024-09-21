import { app } from "./app";
import { setupRabbitMQListener,closeConnection } from "./rabbitmq/rabbitmq";

const PORT = process.env.PORT || 3003;

const start = async () => {

  try {
    await setupRabbitMQListener();
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
