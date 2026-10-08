import cloudinary from "@/Lib/cloudinary";
import connectDB from "@/Lib/mongoDB";
import BrandLogo from "@/Models/brand-logos";

export async function POST(request) {
  try {
    await connectDB();

    const data = await request.json();

    console.log("RECEIVED DATA:", data);

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

    const brandLogo = await BrandLogo.create({
      logos: logos.map((logo) => ({
        id: Number(logo.id),
        url: logo.url,
        publicId: logo.publicId,
      })),
    });

    console.log("SAVED DATA:", brandLogo);

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

// Delete icon from DB and Cloudinary

export async function DELETE(request) {
  try {
    await connectDB();

    const { logoId, publicId } = await request.json();

    if (!logoId || !publicId) {
      return Response.json(
        {
          success: false,
          error: "logoId and publicId are required",
        },
        { status: 400 },
      );
    }

    // Delete directly from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Delete exact logo object
    const result = await BrandLogo.updateOne(
      {
        "logos._id": logoId,
      },
      {
        $pull: {
          logos: {
            _id: logoId,
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

    return Response.json({
      success: true,
      message: "Logo deleted successfully",
      logoId,
      publicId,
    });
  } catch (error) {
    console.error("DELETE LOGO ERROR:", error);

    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
