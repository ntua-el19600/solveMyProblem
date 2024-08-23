import mongoose from "mongoose";

// Enums for problem status and category
enum probStatus {
  Submitted = "submitted",
  Cancelled = "cancelled",
  Complete = "complete",
}

export enum probCategory {
  Linear = "linear",
  Vrp = "vrp",
}

// Interface for problem attributes used when creating a new problem
interface probAttrs {
  user_id: mongoose.Types.ObjectId;
  problem_data: JSON;
  category: probCategory;
}

// Document interface extending mongoose.Document
interface probDoc extends mongoose.Document {
  status: probStatus;
  user_id: mongoose.Types.ObjectId;
  timestamp: Date;
  problem_data: JSON;
  category: probCategory;
  solution: string;
  timelapse: number;
}

// Model interface extending mongoose.Model with a build method
interface probModel extends mongoose.Model<probDoc> {
  build(attrs: probAttrs): probDoc;
}

// Schema definition for Problem
const problemSchema = new mongoose.Schema<probDoc>({
  status: {
    type: String,
    required: true,
    enum: Object.values(probStatus),
    default: probStatus.Submitted,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  problem_data: {
    type: JSON,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: Object.values(probCategory),
  },
  solution: {
    type: String,
    required: true,
    default: "no solution yet",
  },
  timelapse: {
    type: Number,
    required: true,
    default: 0,
  },
});

// Static method to create a new problem instance
problemSchema.statics.build = (attrs: probAttrs) => {
  return new Problem(attrs);
};

// Create and export the Mongoose model
const Problem = mongoose.model<probDoc, probModel>("Problem", problemSchema);

export { Problem };
