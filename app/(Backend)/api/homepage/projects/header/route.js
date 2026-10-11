import { NextResponse } from "next/server";
import connectDB from "@/Lib/mongoDB";
import ProjectsHeader from "@/Models/Projects/ProjectsHeader";

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    if (!body) {
      return NextResponse.json({ status: 404, msg: "Headers not found" });
    }
    const HeadersData = await ProjectsHeader.findOneAndUpdate({}, body, {
      new: true,
      upsert: true,
      runValidators: true,
    });
    return NextResponse.json(
      {
        success: true,
        msg: "Headers saved successfully",
        data: HeadersData,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Save Projects Header Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to save header data." },
      { status: 500 },
    );
  }
}
