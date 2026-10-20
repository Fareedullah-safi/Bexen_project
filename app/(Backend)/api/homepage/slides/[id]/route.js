import { requireDeletePermission } from "@/Lib/AdminPermission/adminPermissions";

export async function DELETE(request) {
  try {
    

    // Keep your existing connectDB, Cloudinary,
    // and MongoDB deletion logic below this point.
  } catch (error) {
    console.error("Delete image error:", error);

    return NextResponse.json(
      { message: "Failed to delete image" },
      { status: 500 },
    );
  }
}
