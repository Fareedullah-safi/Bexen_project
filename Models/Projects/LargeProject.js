import mongoose from "mongoose";

const LargeProjectSchema = new mongoose.Schema(
  {
    tag: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

const LargeProject =
  mongoose.models.LargeProject ||
  mongoose.model("LargeProject", LargeProjectSchema);

export default LargeProject;