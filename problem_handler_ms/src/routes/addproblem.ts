import { Problem } from "../models/problem";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { probCategory } from "../models/problem";
import { validateRequest } from "../middlewares/validate-request";
import { publishToQueue } from "../rabbitmq/rabbitmq";

const router = express.Router();

router.post(
  "/api/probhandler/addproblem",
  [
    body("userId")
      .isString()
      .withMessage("userId must be included and provided on a string")
      .notEmpty(),
    body("category")
      .isString()
      .withMessage("category must be included and provided on a string")
      .isIn(["linear", "vrp"])
      .withMessage("The parameter must be either linear or vrp"),
    body("json")
      .isObject()
      .notEmpty()
      .withMessage("json object must be provided"),
  ],
  validateRequest,

  async (req: Request, res: Response) => {
    const { userId, category, json } = req.body;

    const problemAttrs = {
      user_id: userId,
      problem_data: json,
      category: category as probCategory,
    };

    try {
      const newProblem = Problem.build(problemAttrs);

      await newProblem.save();
      const message = {
        userId: problemAttrs.user_id,
        category: problemAttrs.category,
        problem_data: problemAttrs.problem_data,
        id: newProblem.id,
      };
      const myn = JSON.stringify(message);

      await publishToQueue(myn);
      res.send(newProblem).status(200);
    } catch (err) {
      console.log(err);
    }
  }
);

export { router as addProblemRouter };
