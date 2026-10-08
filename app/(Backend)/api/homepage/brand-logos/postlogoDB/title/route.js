import connectDB from "@/Lib/mongoDB";
import BrandLogoTitle from "@/Models/brand-logo-title";

export async function POST(request) {
  try {
    await connectDB();

    const { title } = await request.json();

    if (!title?.trim()) {
      return Response.json(
        {
          success: false,
          error: "Title is required",
        },
        { status: 400 },
      );
    }

    const data = await BrandLogoTitle.findOneAndUpdate(
      {},
      {
        $set: {
          title: title.trim(),
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );

    return Response.json({
      success: true,
      message: "Title changed successfully",
      data,
    });
  } catch (error) {
    console.error("Brand logo title error:", error);

    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const data = await BrandLogoTitle.findOne();

    return Response.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get brand logo title error:", error);

    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
