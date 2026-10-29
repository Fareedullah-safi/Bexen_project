import mongoose from "mongoose";

const TranslationSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
  },
  { _id: false },
);

const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false },
);

const GallerySectionSchema = new mongoose.Schema(
  {
    translations: {
      en: { type: TranslationSchema, default: () => ({}) },
      ps: { type: TranslationSchema, default: () => ({}) },
      fa: { type: TranslationSchema, default: () => ({}) },
    },
    images: { type: [ImageSchema], default: [] },
  },
  { timestamps: true },
);

export default mongoose.models.GallerySection ||
  mongoose.model("GallerySection", GallerySectionSchema);
