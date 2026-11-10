import mongoose from "mongoose";

const HeaderTranslationSchema = new mongoose.Schema(
  {
    topTag: { type: String, default: "COMMON QUESTIONS" },
    title: { type: String, default: "Need Help? Start Here..." },
    description: {
      type: String,
      default:
        "We stay ahead of the curve, leveraging cutting-edge technologies and strategies to keep you competitive.",
    },
    buttonText: { type: String, default: "Request a Call" },
  },
  { _id: false },
);

const AboutUsFaqsSchema = new mongoose.Schema(
  {
    buttonLink: {
      type: String,
      default: "/contact",
    },
    translations: {
      en: { type: HeaderTranslationSchema, default: () => ({}) },
      ps: { type: HeaderTranslationSchema, default: () => ({}) },
      fa: { type: HeaderTranslationSchema, default: () => ({}) },
    },
  },
  { timestamps: true },
);

export default mongoose.models.AboutUsFaqs ||
  mongoose.model("AboutUsFaqs", AboutUsFaqsSchema);
