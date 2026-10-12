import mongoose from "mongoose";

const Cards = new mongoose.Schema(
  {
    tag: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    publicId: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Cards ||
  mongoose.model("Cards", Cards);
