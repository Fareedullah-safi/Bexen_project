import mongoose from "mongoose";

const IconSchema = new mongoose.Schema(
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

const CardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    default: "",
    trim: true,
  },

  icon: {
    url: String,
    publicId: String,
  },
});

const FeaturesSchema = new mongoose.Schema(
  {
    tagline: {
      type: String,
      default: "",
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    cards: [CardSchema],
  },
  {
    timestamps: true,
  },
);

const Features =
  mongoose.models.Features || mongoose.model("Features", FeaturesSchema);

export default Features;
