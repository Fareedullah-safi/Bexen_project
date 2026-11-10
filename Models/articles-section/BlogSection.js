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

const TitleTranslationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false },
);

const BlogSectionSchema = new mongoose.Schema(
  {
    Titles: {
      en: {
        type: TitleTranslationSchema,
        default: () => ({ title: "The Ultimate <strong>Resource.</strong>" }),
      },
      ps: {
        type: TitleTranslationSchema,
        default: () => ({ title: "" }),
      },
      fa: {
        type: TitleTranslationSchema,
        default: () => ({ title: "" }),
      },
    },
    posts: { type: [ArticleSchema], default: [] },
  },
  { timestamps: true },
);

export default mongoose.models.BlogSection ||
  mongoose.model("BlogSection", BlogSectionSchema);
