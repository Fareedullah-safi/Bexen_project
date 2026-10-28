import mongoose from "mongoose";

const AboutUsBannerSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.AboutUsBanner ||
  mongoose.model("AboutUsBanner", AboutUsBannerSchema);
