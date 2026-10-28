import mongoose from "mongoose";

// Sub-schema for language-specific fields
const LanguageTranslationSchema = new mongoose.Schema(
  {
    topTag: { type: String, default: "CHOOSE THE BEST" },
    mainTitle: {
      type: String,
      default:
        "Driving Innovation and Excellence for Sustainable Corporate Success",
    },
    highlightedTitle: { type: String, default: "Worldwide." },

    // Mission Card
    missionTitle: { type: String, default: "Our Mission" },
    missionDesc: {
      type: String,
      default:
        "Our mission is to empower businesses through innovative best solutions, exceptional service.",
    },
    missionList: {
      type: [String],
      default: [
        "Innovation & Excellence",
        "Exceptional Customer",
        "Business Growth",
      ],
    },

    // Vision Card
    visionTitle: { type: String, default: "Our Vision" },
    visionDesc: {
      type: String,
      default:
        "Our vision is to become a global leader in providing transformative business solutions.",
    },
    visionList: {
      type: [String],
      default: [
        "Global Leadership",
        "Transformative Impact",
        "Sustainable Success",
      ],
    },

    // Progress Floating Box (Labels)
    progressTitle: { type: String, default: "Business Progress" },
    progressLabel1: { type: String, default: "Revenue" },
    progressLabel2: { type: String, default: "Satisfaction" },

    // Button Text
    buttonText: { type: String, default: "Learn More About Us" },
  },
  { _id: false }, // Prevents generating separate _id for each translation object
);

// Main Schema
const AboutSectionSchema = new mongoose.Schema(
  {
    // Shared Media & Link Settings
    image: { type: String, default: "" },
    publicId: { type: String, default: "" },
    buttonLink: { type: String, default: "/about" },

    // Shared Numerical Progress Values (%)
    progressValue1: { type: Number, default: 82, min: 0, max: 100 },
    progressValue2: { type: Number, default: 90, min: 0, max: 100 },

    // Multilingual Content
    translations: {
      en: { type: LanguageTranslationSchema, required: true },
      ps: { type: LanguageTranslationSchema, required: true },
      fa: { type: LanguageTranslationSchema, required: true },
    },
  },
  { timestamps: true },
);

// Prevent re-registering model in Next.js Hot Reloading
const AboutSection =
  mongoose.models.AboutSection ||
  mongoose.model("AboutSection", AboutSectionSchema);

export default AboutSection;
