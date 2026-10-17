import mongoose from "mongoose";

const AdminProfileSchema = new mongoose.Schema(
  {
    UID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    imageUrl: {
      type: String,
      default: "",
    },

    imagePublicId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.AdminProfile ||
  mongoose.model("AdminProfile", AdminProfileSchema);
