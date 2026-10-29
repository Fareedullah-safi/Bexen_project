import mongoose from "mongoose";

const translationSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
  },
  { _id: false },
);

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: "" },
  },
  { _id: false },
);

const albumSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    coverImage: { type: String, default: "" },
    translations: {
      en: { type: translationSchema, default: () => ({}) },
      ps: { type: translationSchema, default: () => ({}) },
      fa: { type: translationSchema, default: () => ({}) },
    },
    images: { type: [imageSchema], default: [] },
  },
  { _id: false },
);

const galleryAlbumSchema = new mongoose.Schema(
  {
    translations: {
      en: { type: translationSchema, default: () => ({}) },
      ps: { type: translationSchema, default: () => ({}) },
      fa: { type: translationSchema, default: () => ({}) },
    },
    albums: { type: [albumSchema], default: [] },
  },
  { timestamps: true },
);

export default mongoose.models.GalleryAlbum ||
  mongoose.model("GalleryAlbum", galleryAlbumSchema);
