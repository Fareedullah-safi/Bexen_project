import mongoose from "mongoose";

const AdminLanguageSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      unique: true,
      index: true,
    },

    language: {
      type: String,
      enum: ["en", "ps", "fa"],
      default: "en",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const AdminLanguage =
  mongoose.models.AdminLanguage ||
  mongoose.model("AdminLanguage", AdminLanguageSchema);

export default AdminLanguage;
