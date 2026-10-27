import { requireEditPermission } from "@/Lib/AdminPermission/adminPermissions";
import dbConnect from "@/Lib/mongoDB";
import Faq from "@/Models/faq/FAQ";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    const data = await Faq.findOne().lean();

    if (data) {
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

      data.faqs = (data.faqs || []).map((faq) => ({
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

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to load FAQ." },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const permission = await requireEditPermission();
    if (!permission.authorized) return permission.response;

    await dbConnect();
    const body = await request.json();

    if (
      !body.headingLineOne?.en?.trim() ||
      !body.headingLineOne?.fa?.trim() ||
      !body.headingLineOne?.ps?.trim() ||
      !body.headingLineTwo?.en?.trim() ||
      !body.headingLineTwo?.fa?.trim() ||
      !body.headingLineTwo?.ps?.trim()
    ) {
      return NextResponse.json(
        { success: false, message: "Fill both headings in all languages." },
        { status: 400 },
      );
    }

    if (
      !body.callHeadingLineOne?.en?.trim() ||
      !body.callHeadingLineOne?.fa?.trim() ||
      !body.callHeadingLineOne?.ps?.trim() ||
      !body.callHeadingLineTwo?.en?.trim() ||
      !body.callHeadingLineTwo?.fa?.trim() ||
      !body.callHeadingLineTwo?.ps?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Fill both call headings in all languages.",
        },
        { status: 400 },
      );
    }

    if (
      !body.phoneNumber?.en?.trim() ||
      !body.phoneNumber?.fa?.trim() ||
      !body.phoneNumber?.ps?.trim() ||
      !body.phoneHref?.en?.trim() ||
      !body.phoneHref?.fa?.trim() ||
      !body.phoneHref?.ps?.trim()
    ) {
      return NextResponse.json(
        { success: false, message: "Fill phone details in all languages." },
        { status: 400 },
      );
    }

    if (
      typeof body.imageURL !== "string" ||
      typeof body.imagePublicId !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid image data." },
        { status: 400 },
      );
    }

    if (!Array.isArray(body.faqs)) {
      return NextResponse.json(
        { success: false, message: "FAQs must be an array." },
        { status: 400 },
      );
    }

    for (const faq of body.faqs) {
      if (
        !faq.id ||
        !faq.question?.en?.trim() ||
        !faq.question?.fa?.trim() ||
        !faq.question?.ps?.trim() ||
        !faq.answer?.en?.trim() ||
        !faq.answer?.fa?.trim() ||
        !faq.answer?.ps?.trim()
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Fill every FAQ question and answer in all languages.",
          },
          { status: 400 },
        );
      }
    }

    const data = await Faq.findOneAndUpdate(
      {},
      { $set: body },
      { new: true, upsert: true, runValidators: true },
    );

    return NextResponse.json({
      success: true,
      message: "FAQ updated successfully.",
      data,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to update FAQ." },
      { status: 500 },
    );
  }
}
