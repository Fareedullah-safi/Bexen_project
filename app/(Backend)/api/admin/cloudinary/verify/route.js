import { requireEditPermission } from "@/Lib/AdminPermission/adminPermissions";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const permission = await requireEditPermission();

    if (!permission.authorized) {
      return NextResponse.json(
        { success: false, message: "Not authorized to upload" },
        { status: 403 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
