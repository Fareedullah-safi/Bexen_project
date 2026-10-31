import mongoose from "mongoose";

const translationSchema = new mongoose.Schema(
  { label: { type: String, default: "" } },
  { _id: false },
);

const searchTranslationSchema = new mongoose.Schema(
  {
    heading: { type: String, default: "" },
    subheading: { type: String, default: "" },
    placeholder: { type: String, default: "" },
  },
  { _id: false },
);

const subLinkSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    href: { type: String, required: true, default: "/" },
    translations: {
      en: { type: translationSchema, default: () => ({}) },
      ps: { type: translationSchema, default: () => ({}) },
      fa: { type: translationSchema, default: () => ({}) },
    },
  },
  { _id: false },
);

const navItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    href: { type: String, required: true, default: "/" },
    hasDropdown: { type: Boolean, default: false }, // REPLACED isBlog WITH hasDropdown
    translations: {
      en: { type: translationSchema, default: () => ({}) },
      ps: { type: translationSchema, default: () => ({}) },
      fa: { type: translationSchema, default: () => ({}) },
    },
    children: { type: [subLinkSchema], default: [] },
  },
  { _id: false },
);

const navMenuSchema = new mongoose.Schema(
  {
    logo: {
      type: String,
      default:
        "https://themejunction.net/html/bexon/demo/assets/images/logos/logo.webp",
    },
    cta: {
      href: { type: String, default: "/contact" },
      translations: {
        en: {
          type: translationSchema,
          default: () => ({ label: "Let's Talk" }),
        },
        ps: {
          type: translationSchema,
          default: () => ({ label: "راځئ خبرې وکړو" }),
        },
        fa: {
          type: translationSchema,
          default: () => ({ label: "بیایید صحبت کنیم" }),
        },
      },
    },
    search: {
      translations: {
        en: {
          type: searchTranslationSchema,
          default: () => ({
            heading: "What are you looking for?",
            subheading: "Search services, projects and articles.",
            placeholder: "Search...",
          }),
        },
        ps: { type: searchTranslationSchema, default: () => ({}) },
        fa: { type: searchTranslationSchema, default: () => ({}) },
      },
    },
    items: { type: [navItemSchema], default: [] },
  },
  { timestamps: true },
);

export default mongoose.models.NavMenu ||
  mongoose.model("NavMenu", navMenuSchema);
