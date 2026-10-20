import { requireEditPermission } from "@/Lib/AdminPermission/adminPermissions";
import connectDB from "@/Lib/mongoDB";
import ProjectsHeader from "@/Models/Projects/ProjectsHeader";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const permission = await requireEditPermission();

if (!permission.authorized) {
  return permission.response;
}
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

// get data
export async function GET() {
  try {
    await connectDB();

    const header = await ProjectsHeader.findOne().lean();

    if (!header) {
      return NextResponse.json(
        {
          success: true,
          header: null,
          message: "No projects header found.",
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        header: {
          badgeText: header.badgeText ?? "",
          headingLine: header.headingLine ?? "",
          highlightWord: header.highlightWord ?? "",
          description: header.description ?? "",
          buttonText: header.buttonText ?? "",
          buttonLink: header.buttonLink ?? "/",
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET projects header error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load projects header.",
      },
      { status: 500 },
    );
  }
}
