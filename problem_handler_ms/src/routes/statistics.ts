import { currentUser } from "../middlewares/current-user";
import { Problem } from "../models/problem";
import express from "express";
import mongoose from "mongoose";

const router = express.Router();
const getStatistics = async (userId: mongoose.Types.ObjectId) => {
  const pipeline = [
    { $match: { user_id: userId } },
    {
      $group: {
        _id: null,
        averageTimelapse: { $avg: "$timelapse" },
        problemsPerCategory: {
          $push: "$category",
        },
        completedCount: {
          $sum: { $cond: [{ $eq: ["$status", "complete"] }, 1, 0] },
        },
        cancelledCount: {
          $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
        },
        submittedCount: {
          $sum: { $cond: [{ $eq: ["$status", "submitted"] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        averageTimelapse: 1,
        problemsPerCategory: {
          $arrayToObject: {
            $map: {
              input: { $setUnion: "$problemsPerCategory" },
              as: "category",
              in: {
                k: "$$category",
                v: {
                  $size: {
                    $filter: {
                      input: "$problemsPerCategory",
                      as: "item",
                      cond: { $eq: ["$$item", "$$category"] },
                    },
                  },
                },
              },
            },
          },
        },
        completedCount: 1,
        cancelledCount: 1,
        submittedCount: 1,
      },
    },
  ];

  const [result] = await Problem.aggregate(pipeline);
  return result;
};

router.get("/api/probhandler/statistics", currentUser, async (req, res) => {
  const userId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(
    req.currentUser!.id
  );
  try {
    const stats = await getStatistics(userId);
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error.");
  }
});

export { router as statisticsRouter };
