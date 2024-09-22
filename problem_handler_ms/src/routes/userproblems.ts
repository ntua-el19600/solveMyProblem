import { Problem } from "../models/problem";
import express from "express";

const router = express.Router();

router.post("/api/probhandler/userProblems", async (req, res) => {
  const { userId } = req.body;

  try {
    const problems = await Problem.find({ user_id: userId }).exec();
    res.send({problems}).status(201);
  } catch (error) {
    console.error("Error finding users by user_id:", error);
  }
});

export { router as userproblemsRouter };
