import mongoose from "mongoose";

const TranslationSchema = new mongoose.Schema(
  {
    en: {
      type: String,
      default: "",
    },
    fa: {
      type: String,
      default: "",
    },
    ps: {
      type: String,
      default: "",
    },
  },
  { _id: false },
);

const ImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      default: "",
    },
    publicId: {
      type: String,
      default: "",
    },
  },
  { _id: false },
);

const AboutUsSchema = new mongoose.Schema(
  {
    experienceNumber: {
      type: TranslationSchema,
      default: () => ({}),
    },

    experienceLabel: {
      type: TranslationSchema,
      default: () => ({}),
    },

    experienceText: {
      type: TranslationSchema,
      default: () => ({}),
    },

    sectionLabel: {
      type: TranslationSchema,
      default: () => ({}),
    },

    title: {
      type: TranslationSchema,
      default: () => ({}),
    },

    description: {
      type: TranslationSchema,
      default: () => ({}),
    },

    mainImage: {
      type: ImageSchema,
      default: () => ({}),
    },

    buttonText: {
      type: TranslationSchema,
      default: () => ({}),
    },

    buttonLink: {
      type: String,
      default: "/about",
    },

    thumbnailImage: {
      type: ImageSchema,
      default: () => ({}),
    },

    videoLink: {
      type: String,
      default: "",
    },

    clientName: {
      type: TranslationSchema,
      default: () => ({}),
    },

    clientRole: {
      type: TranslationSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.AboutUs ||
  mongoose.model("AboutUs", AboutUsSchema);
