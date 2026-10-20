import mongoose from "mongoose";

const BrandLogoSchema = new mongoose.Schema(
  {
    logos: {
      type: [
        {
          id: {
            type: String,
            ref: "BrandLogo",
          },
          publicId: {
            type: String,
            default: "",
          },
          url: {
            type: String,
            required: true,
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.BrandLogo ||
  mongoose.model("BrandLogo", BrandLogoSchema);
