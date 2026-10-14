
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

cloudinary.config({
  secure: true,
});

const FOLDER = "bexon/blog/";

export async function POST(request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");
    const oldPublicId = formData.get("oldPublicId");

    // Check the image
    if (!file || typeof file === "string") {
      return NextResponse.json(
        { message: "Please select an image." },
        { status: 400 },
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "Only JPG, PNG, WEBP, and GIF are allowed." },
        { status: 400 },
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: "Image must be smaller than 5 MB." },
        { status: 400 },
      );
    }

    // Only permit deletion from this blog image folder.
    if (
      oldPublicId &&
      (typeof oldPublicId !== "string" ||
        !oldPublicId.startsWith(FOLDER))
    ) {
      return NextResponse.json(
        { message: "Invalid old image public ID." },
        { status: 400 },
      );
    }

    // Upload the new image first.
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadedImage = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "bexon/blog",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );

      stream.end(buffer);
    });

    // Delete the old image only after the new upload succeeds.
    let oldImageDeleted = false;

    if (oldPublicId && oldPublicId !== uploadedImage.public_id) {
      try {
        const deletedImage = await cloudinary.uploader.destroy(
          oldPublicId,
          { resource_type: "image" },
        );

        oldImageDeleted =
          deletedImage.result === "ok" ||
          deletedImage.result === "not found";

        if (!oldImageDeleted) {
          console.error(
            "Cloudinary did not delete the old image:",
            deletedImage.result,
          );
        }
      } catch (error) {
        // The new image is already uploaded, so preserve its success.
        console.error("Old image deletion failed:", error);
      }
    }

    return NextResponse.json({
      success: true,
      url: uploadedImage.secure_url,
      publicId: uploadedImage.public_id,
      oldImageDeleted,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    return NextResponse.json(
      { message: "Image upload failed. Please try again." },
      { status: 500 },
    );
  }
}
