import mongoose from "mongoose";

const LanguageTranslationSchema = new mongoose.Schema(
  {
    topTag: { type: String, default: "CHOOSE THE BEST" },
    title: {
      type: String,
      default:
        'Driving Innovation and Excellence for Sustainable Corporate Success <span style="color:#1E8A8A">Worldwide.</span>',
    },

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

    progressTitle: { type: String, default: "Business Progress" },
    progressLabel1: { type: String, default: "Revenue" },
    progressLabel2: { type: String, default: "Satisfaction" },

    buttonText: { type: String, default: "Learn More About Us" },
  },
  { _id: false },
);

const AboutSectionSchema = new mongoose.Schema(
  {
    image: { type: String, default: "" },
    publicId: { type: String, default: "" },
    buttonLink: { type: String, default: "/about" },

    progressValue1: { type: Number, default: 82, min: 0, max: 100 },
    progressValue2: { type: Number, default: 90, min: 0, max: 100 },

    translations: {
      en: { type: LanguageTranslationSchema, required: true },
      ps: { type: LanguageTranslationSchema, required: true },
      fa: { type: LanguageTranslationSchema, required: true },
    },
  },
  { timestamps: true },
);

const AboutSection =
  mongoose.models.AboutSection ||
  mongoose.model("AboutSection", AboutSectionSchema);

export default AboutSection;
