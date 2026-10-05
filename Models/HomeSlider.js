import mongoose from "mongoose";

const homeSliderSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
      trim: true,
    },

    publicId: {
      type: String,
      default: null,
      trim: true,
    },

    source: {
      type: String,
      enum: ["upload", "url"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.HomeSlider ||
  mongoose.model("HomeSlider", homeSliderSchema);
