import mongoose from "mongoose";

const backupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    note: { type: String, default: "", trim: true, maxlength: 240 },
    kind: { type: String, enum: ["manual", "auto"], default: "manual" },
    pages: { type: [mongoose.Schema.Types.Mixed], default: [] },
    pageCount: { type: Number, default: 0 },
    navbar: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true, minimize: false },
);

// In development, rebuild the model so schema changes are never ignored.
if (process.env.NODE_ENV !== "production" && mongoose.models.Backup) {
  delete mongoose.models.Backup;
}

export default mongoose.models.Backup || mongoose.model("Backup", backupSchema);
