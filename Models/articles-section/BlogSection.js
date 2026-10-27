import mongoose from "mongoose";

const TranslationSchema = new mongoose.Schema(
  {
    day: { type: String, default: "" },
    month: { type: String, default: "OCT" },
    category: { type: String, default: "", trim: true },
    author: { type: String, default: "Admin", trim: true },
    title: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const ArticleSchema = new mongoose.Schema({
  image: { type: String, required: true },
  publicId: { type: String, default: "" },
  link: { type: String, required: true, trim: true },
  translations: {
    en: { type: TranslationSchema, default: () => ({}) },
    ps: { type: TranslationSchema, default: () => ({}) },
    fa: { type: TranslationSchema, default: () => ({}) },
  },
});

const BlogSectionSchema = new mongoose.Schema(
  {
    Titles: {
      en: {
        sectionTitle: { type: String, default: "The Ultimate" },
        highlightedTitle: { type: String, default: "Resource." },
      },
      ps: {
        sectionTitle: { type: String, default: "" },
        highlightedTitle: { type: String, default: "" },
      },
      fa: {
        sectionTitle: { type: String, default: "" },
        highlightedTitle: { type: String, default: "" },
      },
    },
    posts: { type: [ArticleSchema], default: [] },
  },
  { timestamps: true },
);

export default mongoose.models.BlogSection ||
  mongoose.model("BlogSection", BlogSectionSchema);
