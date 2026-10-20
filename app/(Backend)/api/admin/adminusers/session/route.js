import { getAdminSession } from "@/Lib/getAllCookies/getAdminSession";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const admin = await getAdminSession();
    console.log(admin);

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }
    return NextResponse.json({
      success: true,
      admin: {
        uid: admin.uid,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Session verification error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to verify session" },
      { status: 500 },
    );
  }
}
