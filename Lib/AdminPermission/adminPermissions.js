import { getAdminSession } from "@/Lib/getAllCookies/getAdminSession";
import { NextResponse } from "next/server";

export async function requireDeletePermission() {
  try {
    const admin = await getAdminSession();

    if (!admin) {
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, message: "Not authenticated" },
          { status: 401 },
        ),
      };
    }

    if (!["super-admin", "admin"].includes(admin.role)) {
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, message: "You are not allowed to delete data." },
          { status: 403 },
        ),
      };
    }

    return { authorized: true, admin };
  } catch (error) {
    console.error("Delete permission error:", error);

    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, message: "Unable to verify permissions" },
        { status: 500 },
      ),
    };
  }
}

export async function requireEditPermission() {
  try {
    const admin = await getAdminSession();

    if (!admin) {
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, message: "Not authenticated" },
          { status: 401 },
        ),
      };
    }

    if (admin.role === "viewer") {
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, message: "Read-only users cannot modify data." },
          { status: 403 },
        ),
      };
    }

    return { authorized: true, admin };
  } catch (error) {
    console.error("Edit permission error:", error);

    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, message: "Unable to verify permissions" },
        { status: 500 },
      ),
    };
  }
}
