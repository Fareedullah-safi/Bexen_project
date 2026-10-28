import dbConnect from "@/Lib/mongoDB"; // Change this if your DB connection file is located elsewhere
import FAQSection from "@/Models/About-Page-Models/faqs/FAQS";
import { NextResponse } from "next/server";

// GET: Fetch the FAQ Data
export async function GET() {
  try {
    await dbConnect();

    // Find the single document
    let data = await FAQSection.findOne();

    // If it's the very first time loading and the DB is empty, create the default structure
    if (!data) {
      data = await FAQSection.create({});
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// POST: Update the FAQ Data
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    // Updates the existing document, or creates it if it doesn't exist yet
    const updatedData = await FAQSection.findOneAndUpdate(
      {}, // Empty filter targets the first/only document
      body,
      { new: true, upsert: true, runValidators: true },
    );

    return NextResponse.json({
      success: true,
      message: "FAQ Section updated successfully",
      data: updatedData,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
