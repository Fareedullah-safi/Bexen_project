import { requireEditPermission } from "@/Lib/AdminPermission/adminPermissions";
import dbConnect from "@/Lib/mongoDB";
import AboutSection from "@/Models/About-Page-Models/MissionVision/MissionVision";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    let data = await AboutSection.findOne();

    if (!data) {
      data = await AboutSection.create({});
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const permission = await requireEditPermission();

    if (!permission.authorized) {
      return permission.response;
    }

    await dbConnect();
    const body = await req.json();

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
