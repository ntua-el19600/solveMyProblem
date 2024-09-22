import express, { NextFunction, Request, Response } from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import cors from "cors";

import { errorHandler } from "./middlewares/error-handler";
import { NotFoundError } from "./errors/not-found-error";
import { addProblemRouter } from "./routes/addproblem";
import { userproblemsRouter } from "./routes/userproblems";
import { statisticsRouter } from "./routes/statistics";

const app = express();

const API_KEY = process.env.API_KEY;

const authenticateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next()
};

app.use(cors({
  origin: 'http://localhost:3000',
}));

app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: false,
  })
);

app.use(authenticateApiKey);

app.use(addProblemRouter);
app.use(userproblemsRouter);
app.use(statisticsRouter);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
