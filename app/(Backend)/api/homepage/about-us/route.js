import { requireEditPermission } from "@/Lib/AdminPermission/adminPermissions";
import cloudinary from "@/Lib/cloudinary";
import connectDB from "@/Lib/mongoDB";
import AboutUs from "@/Models/AboutUs";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET: Fetch About Us data
export async function GET() {
  try {
    await connectDB();

    const data = await AboutUs.findOne({}).lean();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("About Us GET Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch About Us data." },
      { status: 500 },
    );
  }
}

// POST: Save About Us data
export async function POST(request) {
  const permission = await requireEditPermission();

  if (!permission.authorized) {
    return permission.response;
  }

  try {
    await connectDB();

    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid About Us data." },
        { status: 400 },
      );
    }

    // Get existing data before updating it.
    const oldData = await AboutUs.findOne({}).lean();

    // Preserve existing images if they aren't sent.
    body.mainImage ??= oldData?.mainImage ?? {
      url: "",
      publicId: "",
    };

    body.thumbnailImage ??= oldData?.thumbnailImage ?? {
      url: "",
      publicId: "",
    };

    // Remove fields that should not be updated from the request.
    delete body._id;
    delete body.__v;
    delete body.createdAt;
    delete body.updatedAt;
    delete body.clientImage;

    // Save or create the About Us document.
    const data = await AboutUs.findOneAndUpdate(
      {},
      {
        $set: body,
        $unset: { clientImage: 1 },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      },
    );

    // Delete the old main image if it was replaced.
    if (
      oldData?.mainImage?.publicId &&
      oldData.mainImage.publicId !== data.mainImage?.publicId
    ) {
      await cloudinary.uploader.destroy(oldData.mainImage.publicId, {
        resource_type: "image",
      });
    }

    // Delete the old thumbnail if it was replaced.
    if (
      oldData?.thumbnailImage?.publicId &&
      oldData.thumbnailImage.publicId !== data.thumbnailImage?.publicId
    ) {
      await cloudinary.uploader.destroy(oldData.thumbnailImage.publicId, {
        resource_type: "image",
      });
    }

    return NextResponse.json({
      success: true,
      message: "About Us saved successfully.",
      data,
    });
  } catch (error) {
    console.error("About Us POST Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to save About Us data." },
      { status: 500 },
    );
  }
}
