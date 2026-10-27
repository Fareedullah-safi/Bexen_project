import mongoose, { Schema } from "mongoose";

const TranslationSchema = new Schema(
  {
    en: { type: String, default: "", trim: true },
    fa: { type: String, default: "", trim: true },
    ps: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const FaqItemSchema = new Schema(
  {
    id: { type: String, required: true },
    question: { type: TranslationSchema, default: () => ({}) },
    answer: { type: TranslationSchema, default: () => ({}) },
  },
  { _id: false },
);

const FaqSchema = new Schema(
  {
    headingLineOne: { type: TranslationSchema, default: () => ({}) },
    headingLineTwo: { type: TranslationSchema, default: () => ({}) },
    callHeadingLineOne: { type: TranslationSchema, default: () => ({}) },
    callHeadingLineTwo: { type: TranslationSchema, default: () => ({}) },

    imageURL: { type: String, default: "", trim: true },
    imagePublicId: { type: String, default: "", trim: true },

    phoneNumber: { type: TranslationSchema, default: () => ({}) },
    phoneHref: { type: TranslationSchema, default: () => ({}) },

    faqs: { type: [FaqItemSchema], default: [] },
  },
  { timestamps: true },
);

const Faq = mongoose.models.Faq || mongoose.model("Faq", FaqSchema);

export default Faq;
