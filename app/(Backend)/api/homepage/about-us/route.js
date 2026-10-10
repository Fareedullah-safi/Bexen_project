import { NextResponse } from "next/server";
import connectDB from "@/Lib/mongoDB";
import AboutUs from "@/Models/AboutUs";

export async function GET() {
  try {
    await connectDB();

    const data = await AboutUs.findOne({});

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("About Us GET Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch About Us data." },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const data = await AboutUs.findOneAndUpdate(
      {},
      { $set: body },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );

    return NextResponse.json({
      success: true,
      message: "About Us data saved successfully.",
      data,
    });
  } catch (error) {
    console.error("About Us POST Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to save About Us data." },
      { status: 500 },
    );
  }
}
