import { requireEditPermission } from "@/Lib/AdminPermission/adminPermissions";
import cloudinary from "@/Lib/cloudinary";
import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    const permission = await requireEditPermission();

    if (!permission.authorized) {
      return permission.response;
    }

    const { publicId } = await request.json();

    if (typeof publicId !== "string" || !publicId.startsWith("bexon/faq/")) {
      return NextResponse.json(
        { success: false, message: "Invalid FAQ image publicId." },
        { status: 400 },
      );
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    if (result.result !== "ok" && result.result !== "not found") {
      return NextResponse.json(
        { success: false, message: "Failed to delete FAQ image." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message:
        result.result === "ok"
          ? "FAQ image deleted successfully."
          : "FAQ image was already deleted.",
    });
  } catch (error) {
    console.error("FAQ image deletion failed:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete FAQ image." },
      { status: 500 },
    );
  }
}
