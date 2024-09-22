import express from "express";
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
app.use(addProblemRouter);
app.use(userproblemsRouter);
app.use(statisticsRouter);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
