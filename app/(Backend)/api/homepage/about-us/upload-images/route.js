import { NextResponse } from "next/server";
import cloudinary from "@/Lib/cloudinary";

export const runtime = "nodejs";

async function uploadImage(file, imageUrl, folder) {
  if (file && typeof file.arrayBuffer === "function" && file.size > 0) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      throw new Error("Only JPG, PNG, and WEBP images are allowed.");
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Image size must not exceed 5MB.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `bexon/${folder}`,
          resource_type: "image",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      stream.end(buffer);
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  if (typeof imageUrl === "string" && imageUrl.trim()) {
    let parsedUrl;

    try {
      parsedUrl = new URL(imageUrl.trim());
    } catch {
      throw new Error("Please provide a valid image URL.");
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("Only HTTP and HTTPS image URLs are allowed.");
    }

    const result = await cloudinary.uploader.upload(parsedUrl.href, {
      folder: `bexon/${folder}`,
      resource_type: "image",
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  return null;
}

export async function POST(request) {
  try {
    const formData = await request.formData();

    const mainFile = formData.get("mainImage");
    const clientFile = formData.get("clientImage");

    const mainUrl = formData.get("mainImageUrl");
    const clientUrl = formData.get("clientImageUrl");

    const [mainImage, clientImage] = await Promise.all([
      uploadImage(mainFile, mainUrl, "about-us/main"),
      uploadImage(clientFile, clientUrl, "about-us/client"),
    ]);

    return NextResponse.json({
      success: true,
      message: "Images uploaded successfully.",
      images: {
        mainImage,
        clientImage,
      },
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Image upload failed.",
      },
      { status: 400 },
    );
  }
}
