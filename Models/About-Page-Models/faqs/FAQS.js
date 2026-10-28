import mongoose from "mongoose";

// Shared translation shape for EN / PS / FA
const TranslationSchema = new mongoose.Schema(
  {
    en: { type: String, default: "", trim: true },
    ps: { type: String, default: "", trim: true },
    fa: { type: String, default: "", trim: true },
  },
  { _id: false },
);

// Single FAQ item
const FaqItemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },
    question: {
      type: TranslationSchema,
      default: () => ({ en: "", ps: "", fa: "" }),
    },
    answer: {
      type: TranslationSchema,
      default: () => ({ en: "", ps: "", fa: "" }),
    },
  },
  { _id: false },
);

// Main FAQ Section document
const FaqSectionSchema = new mongoose.Schema(
  {
    // Section headings
    headingLineOne: {
      type: TranslationSchema,
      default: () => ({ en: "", ps: "", fa: "" }),
    },
    headingLineTwo: {
      type: TranslationSchema,
      default: () => ({ en: "", ps: "", fa: "" }),
    },

    // Background image
    imageURL: {
      type: String,
      default: "",
      trim: true,
    },
    imagePublicId: {
      type: String,
      default: "",
      trim: true,
    },

    // Contact / call box
    callHeadingLineOne: {
      type: TranslationSchema,
      default: () => ({ en: "", ps: "", fa: "" }),
    },
    callHeadingLineTwo: {
      type: TranslationSchema,
      default: () => ({ en: "", ps: "", fa: "" }),
    },
    phoneNumber: {
      type: TranslationSchema,
      default: () => ({ en: "", ps: "", fa: "" }),
    },
    phoneHref: {
      type: TranslationSchema,
      default: () => ({ en: "", ps: "", fa: "" }),
    },

    // Fixed FAQ list (5 items — update only)
    faqs: {
      type: [FaqItemSchema],
      default: () =>
        Array.from({ length: 5 }, (_, index) => ({
          id: String(index + 1),
          question: { en: "", ps: "", fa: "" },
          answer: { en: "", ps: "", fa: "" },
        })),
    },
  },
  {
    timestamps: true,
  },
);

// Avoid model overwrite errors in Next.js hot reload
const FaqSection =
  mongoose.models.FaqSection || mongoose.model("FaqSection", FaqSectionSchema);

export default FaqSection;
