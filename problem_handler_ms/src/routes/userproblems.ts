import { currentUser } from "../middlewares/current-user";
import { Problem } from "../models/problem";
import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/api/probhandler/userProblems", currentUser, async (req, res) => {
  const userId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(
    req.currentUser!.id
  );
  try {
    const problems = await Problem.find({ user_id: userId }).exec();
    res.send(problems).status(201);
  } catch (error) {
    console.error("Error finding users by user_id:", error);
  }
});

export { router as userproblemsRouter };
