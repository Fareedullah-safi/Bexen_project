import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      default: "",
    },
    publicId: {
      type: String,
      default: "",
    },
  },
  { _id: false },
);

const AboutUsSchema = new mongoose.Schema(
  {
    experienceNumber: {
      type: String,
      default: "13+",
    },

    experienceLabel: {
      type: String,
      default: "Years of Experience",
    },

    experienceText: {
      type: String,
      default: "",
    },

    sectionLabel: {
      type: String,
      default: "Get to Know Us",
    },

    title: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    mainImage: {
      type: ImageSchema,
      default: () => ({}),
    },

    buttonText: {
      type: String,
      default: "Learn More",
    },

    buttonLink: {
      type: String,
      default: "/about",
    },

    thumbnailImage: {
      type: ImageSchema,
      default: () => ({}),
    },

    videoLink: {
      type: String,
      default: "",
    },

    clientName: {
      type: String,
      default: "",
    },

    clientRole: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.AboutUs ||
  mongoose.model("AboutUs", AboutUsSchema);
