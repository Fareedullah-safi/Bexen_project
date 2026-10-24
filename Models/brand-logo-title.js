
import mongoose from "mongoose";

const BrandLogoTitleSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.BrandLogoTitle ||
  mongoose.model("BrandLogoTitle", BrandLogoTitleSchema);