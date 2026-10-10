import mongoose from "mongoose";

const AboutUsSchema = new mongoose.Schema(
  {
    experienceNumber: { type: String, default: "13+" },
    experienceLabel: { type: String, default: "Years of Experience" },
    experienceText: { type: String, default: "" },
    sectionLabel: { type: String, default: "Get to Know Us" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },

    mainImage: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },

    buttonText: { type: String, default: "Learn More" },
    buttonLink: { type: String, default: "/about" },

    clientImage: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },

    clientName: { type: String, default: "" },
    clientRole: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.models.AboutUs ||
  mongoose.model("AboutUs", AboutUsSchema);
