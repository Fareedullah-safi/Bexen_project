import dbConnect from "@/Lib/mongoDB"; // your MongoDB connection utility
import AboutSection from "@/models/About-Page-Models/MissionVision/MissionVision";
import { NextResponse } from "next/server";

// GET: Fetch the section data
export async function GET() {
  try {
    await dbConnect();
    // Fetch the single document (or create one if empty)
    let data = await AboutSection.findOne();

    if (!data) {
      data = await AboutSection.create({
        translations: { en: {}, ps: {}, fa: {} },
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// POST/PUT: Update or Create section data
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    // Upsert (Update if exists, create if not)
    const updatedData = await AboutSection.findOneAndUpdate({}, body, {
      new: true,
      upsert: true,
      runValidators: true,
    });

    return NextResponse.json({
      success: true,
      message: "About section updated successfully",
      data: updatedData,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
