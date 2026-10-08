import mongoose from "mongoose";

const BrandLogoSchema = new mongoose.Schema(
  {
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
        url: {
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
