import mongoose from "mongoose";

// Text for the overall page header
const pageTranslationSchema = new mongoose.Schema(
  {
    tag: { type: String, default: "" },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
  },
  { _id: false },
);

// Text for individual video cards
const videoTranslationSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
  },
  { _id: false },
);

// Individual Video Object
const videoSchema = new mongoose.Schema(
  {
    id: { type: String, required: true }, // Frontend unique key
    youtubeUrl: { type: String, default: "" },
    thumbnail: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    translations: {
      en: { type: videoTranslationSchema, default: () => ({}) },
      ps: { type: videoTranslationSchema, default: () => ({}) },
      fa: { type: videoTranslationSchema, default: () => ({}) },
    },
  },
  { _id: false },
);

// Main Singleton Document
const videoGallerySchema = new mongoose.Schema(
  {
    translations: {
      en: { type: pageTranslationSchema, default: () => ({}) },
      ps: { type: pageTranslationSchema, default: () => ({}) },
      fa: { type: pageTranslationSchema, default: () => ({}) },
    },
    videos: { type: [videoSchema], default: [] },
  },
  { timestamps: true },
);

export default mongoose.models.VideoGallery ||
  mongoose.model("VideoGallery", videoGallerySchema);
