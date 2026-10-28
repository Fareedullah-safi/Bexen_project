import mongoose from "mongoose";

// Sub-schema for Header Translations (EN, PS, FA)
const HeaderTranslationSchema = new mongoose.Schema(
  {
    topTag: { type: String, default: "COMMON QUESTIONS" },
    mainTitle: { type: String, default: "Need Help? Start Here..." },
    highlightedTitle: { type: String, default: "Help?" },
    description: {
      type: String,
      default:
        "We stay ahead of the curve, leveraging cutting-edge technologies and strategies to keep you competitive.",
    },
    buttonText: { type: String, default: "Request a Call" },
  },
  { _id: false },
);

// Sub-schema for FAQ Item Question & Answer
const FAQTranslationSchema = new mongoose.Schema(
  {
    question: { type: String, default: "" },
    answer: { type: String, default: "" },
  },
  { _id: false },
);

// Sub-schema for an FAQ Item containing translations for all 3 languages
const FAQItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    translations: {
      en: { type: FAQTranslationSchema, default: () => ({}) },
      ps: { type: FAQTranslationSchema, default: () => ({}) },
      fa: { type: FAQTranslationSchema, default: () => ({}) },
    },
  },
  { _id: false },
);

// Main Schema named AboutUsFaqs
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
    faqs: {
      type: [FAQItemSchema],
      default: () =>
        Array.from({ length: 5 }, (_, i) => ({
          id: String(i + 1),
          translations: {
            en: { question: "", answer: "" },
            ps: { question: "", answer: "" },
            fa: { question: "", answer: "" },
          },
        })),
    },
  },
  { timestamps: true },
);

export default mongoose.models.AboutUsFaqs ||
  mongoose.model("AboutUsFaqs", AboutUsFaqsSchema);
