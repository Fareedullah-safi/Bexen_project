import mongoose, { Schema } from "mongoose";

const TranslationSchema = new Schema(
  {
    en: {
      type: String,
      trim: true,
      default: "",
    },
    fa: {
      type: String,
      trim: true,
      default: "",
    },
    ps: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false },
);

const SolutionsSchema = new Schema(
  {
    badge: {
      type: TranslationSchema,
      default: () => ({}),
    },
    headingOne: {
      type: TranslationSchema,
      default: () => ({}),
    },
    headingTwo: {
      type: TranslationSchema,
      default: () => ({}),
    },
    highlight: {
      type: TranslationSchema,
      default: () => ({}),
    },

    solutions: [
      {
        title: {
          type: TranslationSchema,
          required: [true, "Card title is required"],
          default: () => ({}),
        },
        description: {
          type: TranslationSchema,
          required: [true, "Card description is required"],
          default: () => ({}),
        },
        image: {
          type: String,
          required: [true, "Card image is required"],
          trim: true,
        },
        publicId: {
          type: String,
          default: "",
          trim: true,
        },
      },
    ],
  },
  { timestamps: true },
);

const Solutions =
  mongoose.models.Solutions || mongoose.model("Solutions", SolutionsSchema);

export default Solutions;
