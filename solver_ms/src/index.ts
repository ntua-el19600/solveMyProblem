import { app } from "./app";

const start = async () => {
  app.listen(3003, () => {
    console.log("Listening on port 3003!!!!!!!!");
  });
};

start();
