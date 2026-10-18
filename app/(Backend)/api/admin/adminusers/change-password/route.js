import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import connectDB from "@/Lib/mongoDB";
import AddAdmin from "@/Models/AdminUsers/AddAdmin";
import { getAdminSession } from "@/Lib/getAllCookies/getAdminSession";

export async function POST(request) {
  try {
    await connectDB();

    // Verify the logged-in admin session.
    const session = await getAdminSession();

    if (!session?.uid) {
      return NextResponse.json(
        { success: false, msg: "Please log in to continue." },
        { status: 401 },
      );
    }

    const { currentPassword, newPassword } = await request.json();

    // Validate input.
    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      !currentPassword ||
      !newPassword
    ) {
      return NextResponse.json(
        { success: false, msg: "Please fill in both password fields." },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          msg: "New password must contain at least 8 characters.",
        },
        { status: 400 },
      );
    }

    if (newPassword.length > 128) {
      return NextResponse.json(
        { success: false, msg: "New password is too long." },
        { status: 400 },
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { success: false, msg: "Choose a different new password." },
        { status: 400 },
      );
    }

    // Retrieve the authenticated admin and their password hash.
    const admin = await AddAdmin.findById(session.uid).select("+password");

    if (!admin) {
      return NextResponse.json(
        { success: false, msg: "Administrator account not found." },
        { status: 404 },
      );
    }

    // Verify the current password.
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      admin.password,
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, msg: "Your current password is incorrect." },
        { status: 401 },
      );
    }

    // Hash and save the new password.
    admin.password = await bcrypt.hash(newPassword, 12);
    await admin.save();

    return NextResponse.json({
      success: true,
      msg: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return NextResponse.json(
      { success: false, msg: "Unable to change your password." },
      { status: 500 },
    );
  }
}
