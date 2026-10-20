import { requireEditPermission } from "@/Lib/AdminPermission/adminPermissions";
import cloudinary from "@/Lib/cloudinary";
import connectDB from "@/Lib/mongoDB";
import AboutUs from "@/Models/AboutUs";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Normalize image data
function normalizeImage(image) {
  if (!image || typeof image !== "object") {
    return { url: "", publicId: "" };
  }

  return {
    url: typeof image.url === "string" ? image.url.trim() : "",
    publicId: typeof image.publicId === "string" ? image.publicId.trim() : "",
  };
}

// Check whether an image exists
function hasImage(image) {
  return Boolean(image?.url && image?.publicId);
}

// Delete an old Cloudinary image if it has been replaced
async function deleteOldImage(oldPublicId, newPublicId) {
  if (!oldPublicId || oldPublicId === newPublicId) return;

  try {
    const result = await cloudinary.uploader.destroy(oldPublicId, {
      resource_type: "image",
    });

    if (result.result !== "ok" && result.result !== "not found") {
      console.error("Cloudinary deletion failed:", result);
    }
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
  }
}

// GET: Fetch About Us data
export async function GET() {
  try {
    await connectDB();

    const data = await AboutUs.findOne({}).lean();

    if (!data) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    const mainImage = normalizeImage(data.mainImage);
    const savedThumbnail = normalizeImage(data.thumbnailImage);
    const legacyThumbnail = normalizeImage(data.clientImage);

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        mainImage,
        thumbnailImage: hasImage(savedThumbnail)
          ? savedThumbnail
          : legacyThumbnail,
      },
    });
  } catch (error) {
    console.error("About Us GET Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch About Us data.",
      },
      { status: 500 },
    );
  }
}

// POST: Create or update About Us data
export async function POST(request) {
  const permission = await requireEditPermission();

  if (!permission.authorized) {
    return permission.response;
  }

  try {
    await connectDB();

    const body = await request.json();
    const existing = await AboutUs.findOne({}).lean();

    // Support both the current and legacy thumbnail field names.
    const thumbnailImage = body.thumbnailImage ?? body.clientImage;

    const mainImage =
      body.mainImage !== undefined
        ? normalizeImage(body.mainImage)
        : normalizeImage(existing?.mainImage);

    const newThumbnail =
      thumbnailImage !== undefined
        ? normalizeImage(thumbnailImage)
        : hasImage(normalizeImage(existing?.thumbnailImage))
          ? normalizeImage(existing.thumbnailImage)
          : normalizeImage(existing?.clientImage);

    // Remove MongoDB-managed and legacy fields from the request.
    delete body._id;
    delete body.__v;
    delete body.createdAt;
    delete body.updatedAt;
    delete body.clientImage;

    // Save all About Us fields and both images.
    const data = await AboutUs.findOneAndUpdate(
      {},
      {
        $set: {
          ...body,
          mainImage,
          thumbnailImage: newThumbnail,
        },
        $unset: {
          clientImage: 1,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    // Delete replaced images only after the database update succeeds.
    await Promise.all([
      deleteOldImage(existing?.mainImage?.publicId, data?.mainImage?.publicId),
      deleteOldImage(
        existing?.thumbnailImage?.publicId || existing?.clientImage?.publicId,
        data?.thumbnailImage?.publicId,
      ),
    ]);

    return NextResponse.json({
      success: true,
      message: "About Us saved successfully.",
      data,
    });
  } catch (error) {
    console.error("About Us POST Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save About Us data.",
      },
      { status: 500 },
    );
  }
}
