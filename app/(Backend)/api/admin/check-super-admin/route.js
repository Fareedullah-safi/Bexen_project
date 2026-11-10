import { requireEditPermission } from "@/Lib/AdminPermission/adminPermissions";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const permission = await requireEditPermission();

    // If not authorized by cookie/session
    if (!permission.authorized) {
      return (
        permission.response ||
        NextResponse.json(
          { success: false, message: "Not authorized" },
          { status: 403 },
        )
      );
    }

    // Check user role from permission.admin
    const userRole =
      permission.admin?.role || permission.user?.role || permission.role || "";

    if (userRole !== "super-admin") {
      return NextResponse.json(
        { success: false, message: "Only super admin can perform this action" },
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
