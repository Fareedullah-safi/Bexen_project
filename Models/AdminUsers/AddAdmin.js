import mongoose from "mongoose";

const AdminUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["super-admin", "admin", "editor", "viewer"],
    }
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.AdminUser ||
  mongoose.model("AdminUser", AdminUserSchema);
