import mongoose from "mongoose";

const footerSchema = new mongoose.Schema(
  {
    logo: { type: String, default: "" },
    logoPublicId: { type: String, default: "" },
    projectName: { type: String, default: "Bexon" },

    description: {
      en: { type: String, default: "" },
      ps: { type: String, default: "" },
      fa: { type: String, default: "" },
    },

    contact: {
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
    },

    socials: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      x: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      youtube: { type: String, default: "" },
      github: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
    },

    newsletter: {
      heading: {
        en: { type: String, default: "Subscribe to Our Newsletter." },
        ps: { type: String, default: "زموږ خبر پاڼې کې ګډون وکړئ." },
        fa: { type: String, default: "عضو خبرنامه ما شوید." },
      },
      placeholder: {
        en: { type: String, default: "Enter email" },
        ps: { type: String, default: "ایمیل دننه کړئ" },
        fa: { type: String, default: "ایمیل را وارد کنید" },
      },
      terms: {
        en: { type: String, default: "Agree to our Terms & Condition?" },
        ps: {
          type: String,
          default: "زموږ له شرایطو او مقرراتو سره موافق یاست؟",
        },
        fa: { type: String, default: "با شرایط و ضوابط ما موافق هستید؟" },
      },
    },
  },
  { timestamps: true },
);

export default mongoose.models.Footer || mongoose.model("Footer", footerSchema);
