import mongoose from "mongoose";

const CtaBannerSchema = new mongoose.Schema(
  {
    // The main large text
    title: {
      en: { type: String, default: "Let's Build Future Together." },
      ps: { type: String, default: "راځئ یوځای راتلونکی ودان کړو." },
      fa: { type: String, default: "بیایید آینده را با هم بسازیم." },
    },
    // The text inside the black button
    buttonText: {
      en: { type: String, default: "Get Started Now" },
      ps: { type: String, default: "اوس پیل کړئ" },
      fa: { type: String, default: "همین حالا شروع کنید" },
    },
    // Where the button goes when clicked (Same for all languages)
    buttonLink: { type: String, default: "/contact" },
  },
  { timestamps: true },
);

export default mongoose.models.CtaBanner ||
  mongoose.model("CtaBanner", CtaBannerSchema);
