import connectDB from "@/Lib/mongoDB";
import BrandLogo from "@/Models/brand-logos";

export async function POST(request) {
  try {
    await connectDB();

    const data = await request.json();

    console.log("RECEIVED DATA:", data);

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
