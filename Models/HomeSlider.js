import mongoose from "mongoose";

const slideTranslationSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { _id: false },
);

const slideItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    image: { type: String, required: true, trim: true },
    publicId: { type: String, default: null, trim: true },
    source: {
      type: String,
      enum: ["upload", "url"],
      default: "upload",
    },
    translations: {
      en: { type: slideTranslationSchema, default: () => ({}) },
      ps: { type: slideTranslationSchema, default: () => ({}) },
      fa: { type: slideTranslationSchema, default: () => ({}) },
    },
  },
  { _id: false },
);

const homeSliderSchema = new mongoose.Schema(
  {
    slides: {
      type: [slideItemSchema],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.models.HomeSlider ||
  mongoose.model("HomeSlider", homeSliderSchema);
