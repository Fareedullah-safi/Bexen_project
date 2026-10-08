import mongoose from "mongoose";

const BrandLogoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.BrandLogoTitle ||
  mongoose.model("BrandLogoTitle", BrandLogoSchema);
