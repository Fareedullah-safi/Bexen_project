import dbConnect from "@/Lib/mongoDB";
import Faq from "@/Models/faq/FAQ"; // Adjust import path if needed
import { NextResponse } from "next/server";

const DEFAULT_FAQ_DATA = {
  headingLineOne: {
    en: "Frequently Asked",
    ps: "په مکرر ډول",
    fa: "سوالات متداول",
  },
  headingLineTwo: {
    en: "Questions",
    ps: "پوښتل شوي پوښتنې",
    fa: "و پاسخ‌ها",
  },
  callHeadingLineOne: {
    en: "Have any questions?",
    ps: "کومې پوښتنې لرئ؟",
    fa: "سوال دیگری دارید؟",
  },
  callHeadingLineTwo: {
    en: "Call us today",
    ps: "نن له موږ سره اړیکه ونیسئ",
    fa: "امروز با ما تماس بگیرید",
  },
  imageURL:
    "https://themejunction.net/html/bexon/demo/assets/images/faq/faq-1.webp",
  imagePublicId: "",
  phoneNumber: {
    en: "+1 (009) 544-7818",
    ps: "+1 (009) 544-7818",
    fa: "+1 (009) 544-7818",
  },
  phoneHref: {
    en: "tel:+10095447818",
    ps: "tel:+10095447818",
    fa: "tel:+10095447818",
  },
  faqs: [
    {
      id: "faq-1",
      question: {
        en: "What services does Bexon offer?",
        ps: "بیکسن کوم خدمات وړاندې کوي؟",
        fa: "بکسون چه خدماتی ارائه می‌دهد؟",
      },
      answer: {
        en: "Bexon offers comprehensive business consulting, digital transformation, and market research solutions.",
        ps: "بیکسن د سوداګرۍ هراړخیزه مشورې، ډیجیټل بدلون، او د بازار څیړنې حلونه وړاندې کوي.",
        fa: "بکسون راه‌حل‌های جامع مشاوره کسب‌وکار، تحول دیجیتال و تحقیقات بازار ارائه می‌دهد.",
      },
    },
    {
      id: "faq-2",
      question: {
        en: "How can I schedule a consultation?",
        ps: "زه څنګه کولی شم د مشورې وخت وټاکم؟",
        fa: "چگونه می‌توانم یک جلسه مشاوره تنظیم کنم؟",
      },
      answer: {
        en: "You can reach out via our contact form or call our support team directly to book your consultation.",
        ps: "تاسو کولی شئ زموږ د اړیکو فورمې له لارې یا مستقیم زموږ د ملاتړ ټیم ته زنګ ووهئ.",
        fa: "شما می‌توانید از طریق فرم تماس ما یا تماس مستقیم با تیم پشتیبانی، وقت مشاوره خود را رزرو کنید.",
      },
    },
  ],
};

export async function GET() {
  try {
    await dbConnect();

    let data = await Faq.findOne().lean();

    // If database is empty, create default record automatically
    if (!data) {
      data = await Faq.create(DEFAULT_FAQ_DATA);
      data = data.toObject();
    } else {
      // Compatibility helper: convert string fields to object if legacy data exists
      const fields = [
        "headingLineOne",
        "headingLineTwo",
        "callHeadingLineOne",
        "callHeadingLineTwo",
        "phoneNumber",
        "phoneHref",
      ];

      fields.forEach((field) => {
        if (typeof data[field] === "string") {
          data[field] = { en: data[field], fa: "", ps: "" };
        }
      });

      if (Array.isArray(data.faqs)) {
        data.faqs = data.faqs.map((faq) => ({
          ...faq,
          question:
            typeof faq.question === "string"
              ? { en: faq.question, fa: "", ps: "" }
              : faq.question,
          answer:
            typeof faq.answer === "string"
              ? { en: faq.answer, fa: "", ps: "" }
              : faq.answer,
        }));
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET FAQ Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load FAQ." },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const body = await request.json();

    const updatedFaq = await Faq.findOneAndUpdate(
      {},
      { $set: body },
      { new: true, upsert: true, runValidators: true },
    );

    return NextResponse.json({
      success: true,
      message: "FAQ updated successfully.",
      data: updatedFaq,
    });
  } catch (error) {
    console.error("PUT FAQ Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update FAQ." },
      { status: 500 },
    );
  }
}
