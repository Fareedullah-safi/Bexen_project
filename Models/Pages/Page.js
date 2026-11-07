import mongoose from "mongoose";

const PageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    // Language-specific page titles
    translations: {
      en: {
        title: { type: String, default: "" },
      },
      ps: {
        title: { type: String, default: "" },
      },
      fa: {
        title: { type: String, default: "" },
      },
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    showInNav: {
      type: Boolean,
      default: true,
    },

    navParent: {
      type: String,
      default: "",
    },

    showInFooter: {
      type: Boolean,
      default: false,
    },

    // New Block Architecture
    blocks: [
      {
        blockId: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
        order: {
          type: Number,
          default: 0,
        },
        data: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.models.Page || mongoose.model("Page", PageSchema);
