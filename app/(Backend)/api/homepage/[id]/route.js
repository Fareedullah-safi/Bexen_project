import { NextResponse } from "next/server";
import cloudinary from "@/Lib/cloudinary";
import connectDB from "@/Lib/mongoDB";
import HomeSlider from "@/Models/HomeSlider";

export async function DELETE(request) {
  try {
    await connectDB();

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: "Image ID is required" },
        { status: 400 },
      );
    }

    // Find image in MongoDB
    const slide = await HomeSlider.findById(id);

    if (!slide) {
      return NextResponse.json({ message: "Image not found" }, { status: 404 });
    }

    // Delete from Cloudinary
    if (slide.publicId) {
      await cloudinary.uploader.destroy(slide.publicId);
    }

    // Delete from MongoDB
    await HomeSlider.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Image deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete image error:", error);

    return NextResponse.json(
      { message: error.message || "Failed to delete image" },
      { status: 500 },
    );
  }
}
