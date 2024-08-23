import express, { Request, Response } from "express";
import { body } from "express-validator";
import fs from "fs";
import { validateRequest } from "../middlewares/validate-request";

import path from "path";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";

const router = express.Router();
const TEMP_FILE_NAME = "temp_locations.json";

router.post(
  "/api/solver/solvevrp",
  [
    body("num_vehicles")
      .isNumeric()
      .withMessage("num_vehicles should be number"),
    body("depot").isNumeric().withMessage("depot should be number"),
    body("max_distance")
      .isNumeric()
      .withMessage("max_distance should be number"),
    body("json")
      .isObject()
      .notEmpty()
      .withMessage("json object must be provided"),
  ],
  validateRequest,
  (req: Request, res: Response) => {
    const { num_vehicles, depot, max_distance, json } = req.body;

    const jsonFilePath = path.join(__dirname, TEMP_FILE_NAME);
    fs.writeFileSync(jsonFilePath, JSON.stringify(json, null, 2));

    const pythonFilePath: string = path.join(
      __dirname,
      "..",
      "py",
      "vrpSolver.py"
    );

    const arg3 = num_vehicles.toString();
    const arg4 = depot.toString();
    const arg5 = max_distance.toString();

    const pythonArgs: string[] = [
      pythonFilePath,
      jsonFilePath,
      arg3,
      arg4,
      arg5,
    ];
    let outputData = "";

    const startTime = Date.now();
    const pythonProcess: ChildProcessWithoutNullStreams = spawn(
      "python3",
      pythonArgs
    );

    pythonProcess.stdout.on("data", (data: Buffer) => {
      outputData += data.toString();
    });

    pythonProcess.stderr.on("data", (data: Buffer) => {
      console.error(`Error: ${data.toString()}`);
    });

    pythonProcess.on("close", (code: number) => {
      const endTime = Date.now();
      // Calculate the elapsed time
      fs.unlinkSync(jsonFilePath);
      const elapsedTime = endTime - startTime;
      console.log(`Process exited with code ${code}`);
      console.log(`Time taken: ${elapsedTime} ms`);
      res.json({ solution: outputData, elapsedtime: elapsedTime }).status(200);
    });

    pythonProcess.on("error", (error) => {
      console.error(`Failed to start subprocess: ${error}`);
      res
        .status(500)
        .json({ error: "An error occurred while running the Python script" });
    });
  }
);

export { router as solverRouter };
