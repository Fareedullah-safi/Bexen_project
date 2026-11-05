import mongoose from "mongoose";

const backupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    note: { type: String, default: "" },

    // Full snapshot of all pages (stored as-is, no schema stripping)
    pages: { type: [mongoose.Schema.Types.Mixed], default: [] },
    pageCount: { type: Number, default: 0 },

    // Full snapshot of the navbar (Mixed = nothing gets silently dropped)
    navbar: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true, minimize: false },
);

// In development, rebuild the model so schema changes are picked up
// instead of using a stale cached model.
if (process.env.NODE_ENV !== "production" && mongoose.models.Backup) {
  delete mongoose.models.Backup;
}

export default mongoose.models.Backup || mongoose.model("Backup", backupSchema);
