import { getAdminSession } from "@/Lib/getAllCookies/getAdminSession";
import connectDB from "@/Lib/mongoDB";
import AdminLanguage from "@/Models/AdminUsers/AdminLanguage";
import { NextResponse } from "next/server";

const LANGUAGES = ["en", "ps", "fa"];

export async function GET() {
  try {
    const admin = await getAdminSession();

    if (!admin?.uid) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();

    const data = await AdminLanguage.findOne({
      adminUid: String(admin.uid),
    }).lean();

    return NextResponse.json({
      success: true,
      language: data?.language || "en",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const admin = await getAdminSession();

    if (!admin?.uid) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { language } = await request.json();

    if (!LANGUAGES.includes(language)) {
      return NextResponse.json(
        { success: false, message: "Invalid language" },
        { status: 400 },
      );
    }

    await connectDB();

    await AdminLanguage.findOneAndUpdate(
      { adminId: String(admin.uid) },
      { $set: { language } },
      { upsert: true, runValidators: true },
    );

    return NextResponse.json({ success: true, language });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
