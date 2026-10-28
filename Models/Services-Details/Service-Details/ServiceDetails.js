import mongoose from "mongoose";

// 1. Reusable schema for the main text in all 3 languages
const TextTranslationSchema = new mongoose.Schema(
  {
    mainTitle: { type: String, default: "" },
    highlightedTitle: { type: String, default: "" },
    description1: { type: String, default: "" },
    description2: { type: String, default: "" },
    description3: { type: String, default: "" },
    sidebarTag: { type: String, default: "" },
    sidebarTitle: { type: String, default: "" },
  },
  { _id: false }, // Keeps the DB clean
);

// 2. Schema for the dynamic sidebar links
const ServiceLinkSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    href: { type: String, trim: true, default: "/service-details" },
    translations: {
      en: { label: { type: String, default: "" } },
      ps: { label: { type: String, default: "" } },
      fa: { label: { type: String, default: "" } },
    },
  },
  { _id: false },
);

// 3. Main Service Details Schema
const ServiceDetailsSchema = new mongoose.Schema(
  {
    heroImage: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    translations: {
      en: { type: TextTranslationSchema, default: () => ({}) },
      ps: { type: TextTranslationSchema, default: () => ({}) },
      fa: { type: TextTranslationSchema, default: () => ({}) },
    },
    services: {
      type: [ServiceLinkSchema],
      default: [],
    },
  },
  { timestamps: true }, // Auto-adds createdAt and updatedAt
);

// Industry Standard: Prevent Next.js hot-reload OverwriteModelError
export default mongoose.models.ServiceDetails ||
  mongoose.model("ServiceDetails", ServiceDetailsSchema);
