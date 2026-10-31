import { requireEditPermission } from "@/Lib/AdminPermission/adminPermissions";
import dbConnect from "@/Lib/mongoDB";
import AboutUsFaqs from "@/Models/About-Page-Models/AboutUsFaqs/FAQS";
import { NextResponse } from "next/server";

// GET: Fetch existing section header or create initial default record
export async function GET() {
  try {
    await dbConnect();

    let faqData = await AboutUsFaqs.findOne();

    // If no document exists yet, create default record
    if (!faqData) {
      faqData = await AboutUsFaqs.create({});
    }

    return NextResponse.json({
      success: true,
      data: faqData,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch FAQ section",
      },
      { status: 500 },
    );
  }
}

// POST: Update existing FAQ section header fields
export async function POST(req) {
  try {
    const permission = await requireEditPermission();

    if (!permission.authorized) {
      return permission.response;
    }

    await dbConnect();
    const body = await req.json();

    const updatedFaq = await AboutUsFaqs.findOneAndUpdate({}, body, {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    });

    return NextResponse.json({
      success: true,
      message: "FAQ Section updated successfully.",
      data: updatedFaq,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update FAQ section",
      },
      { status: 500 },
    );
  }
}
