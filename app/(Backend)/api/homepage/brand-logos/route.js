import { requireDeletePermission } from "@/Lib/AdminPermission/adminPermissions";
import cloudinary from "@/Lib/cloudinary";
import connectDB from "@/Lib/mongoDB";
import BrandLogo from "@/Models/brand-logos";

export async function POST(request) {
  try {
    await connectDB();

    const data = await request.json();
    const { logos } = data;

    if (!logos?.length) {
      return Response.json(
        {
          success: false,
          error: "Logos are required",
        },
        { status: 400 },
      );
    }

    const brandLogo = await BrandLogo.findOneAndUpdate(
      {},
      {
        $push: {
          logos: {
            $each: logos.map((logo) => ({
              id: Number(logo.id),
              url: logo.url,
              publicId: logo.publicId,
            })),
          },
        },
      },
      { new: true, upsert: true },
    );

    return Response.json({
      success: true,
      data: brandLogo,
    });
  } catch (error) {
    console.error("MongoDB error:", error);

    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// Get data from DB
export async function GET() {
  try {
    await connectDB();

    const data = await BrandLogo.find();

    return Response.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET brand logos error:", error);

    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// Delete logo from DB and Cloudinary
export async function DELETE(request) {
  try {
    const permission = await requireDeletePermission();

    if (!permission.authorized) {
      return permission.response;
    }

    await connectDB();

    const { publicId } = await request.json();

    if (!publicId) {
      return Response.json(
        {
          success: false,
          error: "publicId is required",
        },
        { status: 400 },
      );
    }

    // Find and delete the logo using only publicId
    const result = await BrandLogo.updateOne(
      {
        "logos.publicId": publicId,
      },
      {
        $pull: {
          logos: {
            publicId,
          },
        },
      },
    );

    if (result.modifiedCount === 0) {
      return Response.json(
        {
          success: false,
          error: "Logo not found",
        },
        { status: 404 },
      );
    }

    // Delete image from Cloudinary
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error("Cloudinary deletion error:", error);
    }

    return Response.json({
      success: true,
      message: "Logo deleted successfully",
      publicId,
    });
  } catch (error) {
    console.error("DELETE LOGO ERROR:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to delete logo",
      },
      { status: 500 },
    );
  }
}
