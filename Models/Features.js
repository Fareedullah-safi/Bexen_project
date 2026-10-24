import mongoose from "mongoose";

const FeaturesSchema = new mongoose.Schema(
  {
    // Section heading in each language
    translations: {
      en: {
        tagline: { type: String, default: "" },
        title: { type: String, default: "" },
      },
      ps: {
        tagline: { type: String, default: "" },
        title: { type: String, default: "" },
      },
      fa: {
        tagline: { type: String, default: "" },
        title: { type: String, default: "" },
      },
    },

    // All feature cards
    cards: [
      {
        // Text in each language
        translations: {
          en: {
            title: { type: String, default: "" },
            description: { type: String, default: "" },
          },
          ps: {
            title: { type: String, default: "" },
            description: { type: String, default: "" },
          },
          fa: {
            title: { type: String, default: "" },
            description: { type: String, default: "" },
          },
        },

        // Shared icon for all languages
        icon: {
          url: { type: String, default: "" },
          publicId: { type: String, default: "" },
        },
      },
    ],
  },
  { timestamps: true },
);

const Features =
  mongoose.models.Features || mongoose.model("Features", FeaturesSchema);

export default Features;
