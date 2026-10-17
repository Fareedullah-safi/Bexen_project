import connectDB from "@/Lib/mongoDB";
import AdminProfile from "@/Models/AdminUsers/ProfileImage";
import { getAdminSession } from "@/Lib/getAllCookies/getAdminSession";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const admin = await getAdminSession();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 },
      );
    }

    await connectDB();

    const { name, imageUrl, publicId } = await req.json();

    if (!name?.trim() || !imageUrl || !publicId) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, image URL, and public ID are required.",
        },
        { status: 400 },
      );
    }

    const savedProfile = await AdminProfile.findOneAndUpdate(
      { UID: admin.uid },
      {
        $set: {
          UID: admin.uid,
          name: name.trim(),
          imageUrl,
          imagePublicId: publicId,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );

    return NextResponse.json({
      success: true,
      message: "Profile saved successfully.",
      data: savedProfile,
    });
  } catch (error) {
    console.error("PROFILE SAVE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Unable to save profile.",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const admin = await getAdminSession();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 },
      );
    }

    await connectDB();

    const profile = await AdminProfile.findOne({
      UID: admin.uid,
    }).lean();

    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Profile not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("PROFILE FETCH ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Unable to fetch profile.",
      },
      { status: 500 },
    );
  }
}
