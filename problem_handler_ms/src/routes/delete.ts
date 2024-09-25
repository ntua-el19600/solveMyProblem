import { Problem } from "../models/problem";
import express, { Request, Response } from "express";

const router = express.Router();

router.post("/api/probhandler/delete", async (req: Request, res: Response) => {
  const { id, userId } = req.body;

  try {
    const deletedProblem = await Problem.findOneAndDelete({
      _id: id,
      user_id: userId,
    }).exec();

    if (deletedProblem) {
      res
        .status(200)
        .send({ message: "Problem deleted successfully", deletedProblem });
    } else {
      res.status(404).send({ message: "Problem not found" });
    }
  } catch (error) {
    res.status(500).send({ message: "Error deleting problem", error });
  }
});

export { router as deleteRouter };
