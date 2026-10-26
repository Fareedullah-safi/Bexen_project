import mongoose from "mongoose";

const TranslationSchema = new mongoose.Schema(
  {
    en: {
      type: String,
      required: [true, "English translation is required"],
      trim: true,
      minlength: [1, "English translation cannot be empty"],
    },
    ps: {
      type: String,
      required: [true, "Pashto translation is required"],
      trim: true,
      minlength: [1, "Pashto translation cannot be empty"],
    },
    fa: {
      type: String,
      required: [true, "Dari translation is required"],
      trim: true,
      minlength: [1, "Dari translation cannot be empty"],
    },
  },
  { _id: false },
);

const StatsSchema = new mongoose.Schema({
  value: {
    type: TranslationSchema,
    required: [true, "Stat value is required"],
  },
  label: {
    type: TranslationSchema,
    required: [true, "Stat label is required"],
  },
});

const ReviewSchema = new mongoose.Schema({
  name: {
    type: TranslationSchema,
    required: [true, "Reviewer name is required"],
  },
  role: {
    type: TranslationSchema,
    required: [true, "Reviewer role is required"],
  },
  text: {
    type: TranslationSchema,
    required: [true, "Review text is required"],
  },
  image: {
    type: String,
    required: [true, "Reviewer image is required"],
    trim: true,
    minlength: [1, "Reviewer image cannot be empty"],
  },
  publicId: {
    type: String,
    default: "",
    trim: true,
  },
});

const ReviewSectionSchema = new mongoose.Schema(
  {
    section: {
      badgeText: {
        type: TranslationSchema,
        required: [true, "Badge text is required"],
      },
      highlightWord: {
        type: TranslationSchema,
        required: [true, "Highlight word is required"],
      },
      headingLineOne: {
        type: TranslationSchema,
        required: [true, "First heading line is required"],
      },
      headingLineTwo: {
        type: TranslationSchema,
        required: [true, "Second heading line is required"],
      },
      description: {
        type: TranslationSchema,
        required: [true, "Section description is required"],
      },
    },

    stats: {
      type: [StatsSchema],
      default: [],
    },

    reviews: {
      type: [ReviewSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const ReviewSection =
  mongoose.models.ReviewSection ||
  mongoose.model("ReviewSection", ReviewSectionSchema);

export default ReviewSection;
