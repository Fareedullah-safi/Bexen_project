import connectDB from "@/Lib/mongoDB";
import BrandLogo from "@/Models/brand-logos";

export async function POST(request) {
  try {
    await connectDB();

    const data = await request.json();

    const { title, logos } = data;

    if (!title || !logos?.length) {
      return Response.json(
        {
          success: false,
          error: "Title and logos are required",
        },
        { status: 400 },
      );
    }

    const brandLogo = await BrandLogo.create({
      title,
      logos,
    });

    return Response.json({
      success: true,
      data: brandLogo,
    });
  } catch (error) {
    console.error("MongoDB error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to save data",
      },
      { status: 500 },
    );
  }
}
