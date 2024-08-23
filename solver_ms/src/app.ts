import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";

import { errorHandler } from "./middlewares/error-handler";
import { NotFoundError } from "./errors/not-found-error";
import { solverRouter } from "./routes/solveVrp";
import { solverRouterB } from "./routes/solveLinear";

const app = express();

app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: false,
  })
);

app.use(solverRouter);
app.use(solverRouterB);
app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
