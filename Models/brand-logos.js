import mongoose from "mongoose";

const BrandLogoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    logos: [
      {
        id: {
          type: Number,
          required: true,
        },

        publicId: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.BrandLogo ||
  mongoose.model("BrandLogo", BrandLogoSchema);
