import { NextResponse } from "next/server";
import cloudinary from "@/Lib/cloudinary";
import dbConnect from "@/Lib/mongoDB";
import HomeSlider from "@/Models/HomeSlider";

export async function POST(request) {
  try {
    await dbConnect();

    const formData = await request.formData();

    const file = formData.get("image");
    const imageUrl = formData.get("imageUrl");

    // Upload image from PC
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const result = await new Promise((resolve, reject) =>
        cloudinary.uploader
          .upload_stream({ folder: "home-slider" }, (error, result) =>
            error ? reject(error) : resolve(result),
          )
          .end(buffer),
      );

      const slide = await HomeSlider.create({
        image: result.secure_url,
        publicId: result.public_id,
        source: "upload",
      });

      return NextResponse.json(slide, { status: 201 });
    }

    // Upload image from URL
    if (imageUrl) {
      const result = await cloudinary.uploader.upload(imageUrl, {
        folder: "home-slider",
      });

      const slide = await HomeSlider.create({
        image: result.secure_url,
        publicId: result.public_id,
        source: "url",
      });

      return NextResponse.json(slide, { status: 201 });
    }

    return NextResponse.json(
      { message: "Select an image or enter an image URL" },
      { status: 400 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: error.message || "Upload failed" },
      { status: 500 },
    );
  }
}

// get data

export async function GET() {
  try {
    await dbConnect();
    const slides = await HomeSlider.find();
    return NextResponse.json({ slides });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch slides" },
      { status: 500 },
    );
  }
}

// delete api
export async function DELETE(request) {
  try {
    await dbConnect();

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: "Image ID is required" },
        { status: 400 },
      );
    }

    const slide = await HomeSlider.findById(id);

    if (!slide) {
      return NextResponse.json({ message: "Image not found" }, { status: 404 });
    }

    if (slide.publicId) {
      await cloudinary.uploader.destroy(slide.publicId);
    }

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
