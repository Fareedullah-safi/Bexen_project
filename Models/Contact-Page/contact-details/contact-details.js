import mongoose from "mongoose";

const TranslationSchema = new mongoose.Schema(
  {
    topTag: { type: String, default: "CONTACT INFO" },
    highlightedTitle: { type: String, default: "Reach" },
    mainTitle: { type: String, default: "Out to Us" },

    locationTitle: { type: String, default: "Our Location" },
    locationAddress: {
      type: String,
      default: "993 Renner Burg, West Rond, MT 94251-030",
    },

    emailTitle: { type: String, default: "Email us" },
    phoneTitle: { type: String, default: "Call us" },

    chatTitle: { type: String, default: "Live chat" },
    chatLinkText: { type: String, default: "Need help?" },
  },
  { _id: false },
);

const ContactInfoSchema = new mongoose.Schema(
  {
    translations: {
      en: { type: TranslationSchema, default: () => ({}) },
      ps: { type: TranslationSchema, default: () => ({}) },
      fa: { type: TranslationSchema, default: () => ({}) },
    },
    shared: {
      email1: { type: String, default: "support@bexon.com" },
      email2: { type: String, default: "info@bexon.com" },
      phone1: { type: String, default: "+1 (009) 544-7818" },
      phone2: { type: String, default: "+1 (009) 880-1810" },
      chatEmail: { type: String, default: "livechat@bexon.com" },
      chatLinkUrl: { type: String, default: "/contact" },
    },
  },
  { timestamps: true },
);

export default mongoose.models.ContactInfo ||
  mongoose.model("ContactInfo", ContactInfoSchema);
