import fs from "fs";
import path from "path";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";

const TEMP_FILE_NAME = "linear_temp.json";



interface LinearProblemSolution {
  solution: string;
  elapsedTime: number;
}

export const solveLinearProblem = async (
  input: JSON
): Promise<LinearProblemSolution> => {
  return new Promise((resolve, reject) => {
    try {
      const jsonFilePath = path.join(__dirname, TEMP_FILE_NAME);
      fs.writeFileSync(jsonFilePath, JSON.stringify(input, null, 2));

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
        const elapsedTime = endTime - startTime;

        fs.unlinkSync(jsonFilePath);

        if (code === 0) {
          resolve({ solution: outputData, elapsedTime });
        } else {
          reject(new Error(`Python process exited with code ${code}`));
        }
      });

      pythonProcess.on("error", (error) => {
        reject(new Error(`Failed to start subprocess: ${error.message}`));
      });
    } catch (error) {
      reject(new Error(`Error processing the linear problem: `));
    }
  });
};
