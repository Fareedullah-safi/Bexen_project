import { NextResponse } from "next/server";
import cloudinary from "@/Lib/cloudinary";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const ids = formData.getAll("ids");
    const files = formData.getAll("files");
    const urls = formData.getAll("urls");

    const logos = [];
    let fileIndex = 0;

    for (let index = 0; index < ids.length; index++) {
      const id = Number(ids[index]);
      const url = String(urls[index] || "").trim();

      if (![1, 2, 3].includes(id)) {
        return NextResponse.json(
          { success: false, error: `Invalid logo ID: ${ids[index]}` },
          { status: 400 },
        );
      }

      const file = files[fileIndex];
      const hasFile =
        file && typeof file.arrayBuffer === "function" && file.size > 0;

      // Uploaded files are stored in Cloudinary.
      if (hasFile) {
        fileIndex++;

        if (
          !["image/jpeg", "image/png", "image/webp", "image/svg+xml"].includes(
            file.type,
          )
        ) {
          return NextResponse.json(
            {
              success: false,
              error: `${file.name} must be JPG, PNG, WEBP, or SVG.`,
            },
            { status: 400 },
          );
        }

        if (file.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            {
              success: false,
              error: `${file.name} exceeds the 5MB limit.`,
            },
            { status: 400 },
          );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const uploaded = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "brand-logos",
              resource_type: "image",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          );

          stream.end(buffer);
        });

        logos.push({
          id,
          url: uploaded.secure_url,
          publicId: uploaded.public_id,
        });

        continue;
      }

      // Existing external image URLs don't require a Cloudinary upload.
      if (url) {
        try {
          const parsedUrl = new URL(url);

          if (!["http:", "https:"].includes(parsedUrl.protocol)) {
            throw new Error("Invalid URL protocol");
          }
        } catch {
          return NextResponse.json(
            {
              success: false,
              error: `Logo ${id} has an invalid image URL.`,
            },
            { status: 400 },
          );
        }

        logos.push({
          id,
          url,
          publicId: "",
        });
      }
    }

    if (!logos.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Please upload a logo or provide an image URL.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Brand logos processed successfully.",
      logos,
    });
  } catch (error) {
    console.error("Brand logos Cloudinary upload error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Cloudinary upload failed.",
      },
      { status: 500 },
    );
  }
}
