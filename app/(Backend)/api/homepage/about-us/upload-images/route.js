import { NextResponse } from "next/server";
import cloudinary from "@/Lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function uploadImage(file, imageUrl, folder) {
  // Upload a local file.
  if (
    file &&
    typeof file.arrayBuffer === "function" &&
    file.size > 0
  ) {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        "Only JPG, PNG, and WEBP images are allowed."
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error(
        "Image size must not exceed 5MB."
      );
    }

    const buffer = Buffer.from(
      await file.arrayBuffer()
    );

    const result = await new Promise(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `bexon/${folder}`,
            resource_type: "image",
            secure: true,
          },
          (error, uploadedResult) => {
            if (error) {
              reject(error);
              return;
            }

            if (!uploadedResult?.secure_url) {
              reject(
                new Error(
                  "Cloudinary upload succeeded without returning secure_url."
                )
              );
              return;
            }

            resolve(uploadedResult);
          }
        );

        stream.on("error", reject);
        stream.end(buffer);
      }
    );

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  // Upload an image from a URL.
  if (
    typeof imageUrl === "string" &&
    imageUrl.trim()
  ) {
    let parsedUrl;

    try {
      parsedUrl = new URL(imageUrl.trim());
    } catch {
      throw new Error("Please provide a valid image URL.");
    }

    if (
      parsedUrl.protocol !== "https:" &&
      parsedUrl.protocol !== "http:"
    ) {
      throw new Error(
        "Image URL must use HTTP or HTTPS."
      );
    }

    const result = await cloudinary.uploader.upload(
      parsedUrl.toString(),
      {
        folder: `bexon/${folder}`,
        resource_type: "image",
        secure: true,
      }
    );

    if (!result?.secure_url) {
      throw new Error(
        "Cloudinary did not return secure_url."
      );
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  // No new image was provided.
  return null;
}

export async function POST(request) {
  try {
    const formData = await request.formData();

    // Both image fields use the new names.
    const mainFile = formData.get("mainImage");
    const thumbnailFile = formData.get("thumbnailImage");

    const mainImageUrl = formData.get("mainImageUrl");
    const thumbnailImageUrl = formData.get(
      "thumbnailImageUrl"
    );

    const images = {};

    // Upload main image if supplied.
    if (
      (mainFile instanceof File && mainFile.size > 0) ||
      (typeof mainImageUrl === "string" &&
        mainImageUrl.trim())
    ) {
      images.mainImage = await uploadImage(
        mainFile,
        mainImageUrl,
        "about-us"
      );
    }

    // Upload thumbnail image if supplied.
    if (
      (thumbnailFile instanceof File &&
        thumbnailFile.size > 0) ||
      (typeof thumbnailImageUrl === "string" &&
        thumbnailImageUrl.trim())
    ) {
      images.thumbnailImage = await uploadImage(
        thumbnailFile,
        thumbnailImageUrl,
        "about-us"
      );
    }

    return NextResponse.json({
      success: true,
      message: "Images uploaded successfully.",
      images,
    });
  } catch (error) {
    console.error("About Us image upload error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Failed to upload About Us images.",
      },
      { status: 400 }
    );
  }
}
