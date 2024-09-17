import { currentUser } from "../middlewares/current-user";
import { Problem } from "../models/problem";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { requireAuth } from "../middlewares/require-auth";
import { probCategory } from "../models/problem";
import { validateRequest } from "../middlewares/validate-request";
import mongoose from "mongoose";
import { publishToQueue } from "../rabbitmq/rabbitmq";

const router = express.Router();

router.post(
  "/api/probhandler/addproblem",
  currentUser,
  requireAuth,
  [
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
    const { category, json } = req.body;
    const kat: probCategory = category as probCategory;
    const user_id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(
      req.currentUser!.id
    );

    const problemAttrs = {
      user_id: user_id,
      problem_data: json,
      category: kat,
    };

    try {
      const newProblem = Problem.build(problemAttrs);

      await newProblem.save();
      const message = {
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
