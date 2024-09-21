import express, { Request, Response } from "express";
import { body } from "express-validator";
import fs from "fs";
import { validateRequest } from "../middlewares/validate-request";

import path from "path";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";

const router = express.Router();
const TEMP_FILE_NAME = "linear_temp.json";

router.post(
  "/api/solver/solvelinear",
  [
    body("Variables")
      .isArray()
      .withMessage("Variables should be an array of strings")
      .custom((value) => value.every((v: any) => typeof v === "string"))
      .withMessage("Each variable should be a string"),

    body("Constraints")
      .isArray()
      .withMessage("Constraints should be an array of strings")
      .custom((value) => value.every((v: any) => typeof v === "string"))
      .withMessage("Each constraint should be a string"),

    body("Objective").isString().withMessage("Objective should be a string"),
  ],
  validateRequest,
  (req: Request, res: Response) => {
    const jsonData = req.body;
    const jsonFilePath = path.join(__dirname, TEMP_FILE_NAME);
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));
    
    console.log("JSON data sent to Python:", jsonData);

    const pythonFilePath: string = path.join(
      __dirname,
      "..",
      "py",
      "linearSolver.py"
    );
    const pythonArgs: string[] = [pythonFilePath, jsonFilePath];
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

export { router as solverRouterB };
