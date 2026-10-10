import mongoose, { Schema } from "mongoose";

const SolutionsSchema = new Schema(
  {
    badge: {
      type: String,
      default: "OUR SOLUTIONS",
      trim: true,
    },
    headingOne: {
      type: String,
      default: "Solutions to Transform",
      trim: true,
    },
    headingTwo: {
      type: String,
      default: "Your",
      trim: true,
    },
    highlight: {
      type: String,
      default: "Business.",
      trim: true,
    },
    solutions: [
      {
        title: {
          type: String,
          required: [true, "Card title is required"],
          trim: true,
        },
        description: {
          type: String,
          required: [true, "Card description is required"],
          trim: true,
        },
        image: {
          type: String,
          required: [true, "Card image is required"],
        },
        publicId: {
          type: String,
          default: "",
        },
      },
    ],
  },
  { timestamps: true },
);

const Solutions =
  mongoose.models.Solutions || mongoose.model("Solutions", SolutionsSchema);

export default Solutions;
