import mongoose from "mongoose";

const FaqItemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false },
);

const FaqSchema = new mongoose.Schema(
  {
    headingLineOne: {
      type: String,
      default: "Need Help? Start",
    },
    headingLineTwo: {
      type: String,
      default: "Here...",
    },
    imageURL: {
      type: String,
      default: "",
    },
    imagePublicId: {
      type: String,
      default: "",
    },
    callHeadingLineOne: {
      type: String,
      default: "Get Started",
    },
    callHeadingLineTwo: {
      type: String,
      default: "Free Call?",
    },
    phoneNumber: {
      type: String,
      default: "1-888-452-1505",
    },
    phoneHref: {
      type: String,
      default: "tel:18884521505",
    },
    faqs: {
      type: [FaqItemSchema],
      default: [
        {
          id: "faq-1",
          question: "What services does Bexon offer to clients?",
          answer:
            "Getting started is easy! Simply reach out to us through our contact form or give us a call, and we'll schedule a consultation to discuss your project and how we can best assist you.",
        },
        {
          id: "faq-2",
          question: "How do I get started with Corporate Business?",
          answer: "",
        },
        {
          id: "faq-3",
          question: "How do you ensure the success of a project?",
          answer: "",
        },
        {
          id: "faq-4",
          question: "How long will it take to complete my project?",
          answer: "",
        },
        {
          id: "faq-5",
          question: "Can I track the progress of my project?",
          answer: "",
        },
      ],
    },
  },
  { timestamps: true },
);

export default mongoose.models.Faq ||
  mongoose.model("Faq", FaqSchema);