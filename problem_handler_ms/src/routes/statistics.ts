import { Problem } from "../models/problem";
import express, { Request, Response } from "express";

const router = express.Router();

router.get("/api/probhandler/statistics", async (req: Request, res: Response) => {
  const { userId } = req.body;  // Assuming the userId is in the format 'user_xxx'

  if (!userId || !userId.startsWith("user_")) {
    return res.status(400).json({ error: 'Valid User ID is required' });
  }

  try {
    // Use userId as a string directly in the query
    const pipeline = [
      { $match: { user_id: userId } },  // No ObjectId conversion here
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

    const [stats] = await Problem.aggregate(pipeline);

    if (!stats) {
      return res.status(404).json({ error: "No statistics found for the user" });
    }

    res.json(stats);
  } catch (err) {
    console.error("Error fetching statistics:", err);
    res.status(500).send("Server error.");
  }
});

export { router as statisticsRouter };
