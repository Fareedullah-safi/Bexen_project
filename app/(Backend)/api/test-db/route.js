import connectDB from "@/Lib/mongoDB"
export async function GET() {
  try {
    await connectDB();

    return Response.json({
      success: true,
      message: "MongoDB Atlas is connected successfully",
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);

    return Response.json(
      {
        success: false,
        message: "MongoDB connection failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}