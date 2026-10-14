import mongoose from "mongoose";

const ArticleSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
    },

    day: {
      type: String,
      required: true,
    },

    month: {
      type: String,
      required: true,
      uppercase: true,
    },

    image: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    author: {
      type: String,
      required: true,
      trim: true,
      default: "Admin",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    link: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const BlogSectionSchema = new mongoose.Schema(
  {
    sectionTitle: {
      type: String,
      required: true,
      default: "The Ultimate",
      trim: true,
    },

    highlightedTitle: {
      type: String,
      required: true,
      default: "Resource.",
      trim: true,
    },

    posts: {
      type: [ArticleSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const BlogSection =
  mongoose.models.BlogSection ||
  mongoose.model("BlogSection", BlogSectionSchema);

export default BlogSection;
