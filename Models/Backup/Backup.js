import mongoose from "mongoose";

const BackupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Full copy of every page document at the moment of backup
    pages: {
      type: Array,
      default: [],
    },
    pageCount: {
      type: Number,
      default: 0,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Backup || mongoose.model("Backup", BackupSchema);
