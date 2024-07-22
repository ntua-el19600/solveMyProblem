import mongoose from "mongoose";
import { DatabaseConnectionError } from "./errors/database-connection-error";

import { app } from "./app";

const start = async () => {
  try {
    await mongoose.connect("mongodb://localhost:2000");

    console.log("Connected to MongoDb");
  } catch (err) {
    console.log(new DatabaseConnectionError());
  }

  app.listen(3000, () => {
    console.log("Listening on port 3000!!!!!!!!");
  });
};

start();
