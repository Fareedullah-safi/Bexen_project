import { NextResponse } from "next/server";
import cloudinary from "@/Lib/cloudinary";
export async function POST(request) {
  try {
    let image;

    if (
      (request.headers.get("content-type") || "").includes("application/json")
    ) {
      const { imageUrl } = await request.json();

      let parsedUrl;
      try {
        parsedUrl = new URL(imageUrl);
      } catch {
        return NextResponse.json(
          { error: "Enter a valid image URL." },
          { status: 400 },
        );
      }

      if (parsedUrl.protocol !== "https:") {
        return NextResponse.json(
          { error: "Use an HTTPS image URL." },
          { status: 400 },
        );
      }

      image = await cloudinary.uploader.upload(parsedUrl.href, {
        folder: "bexon/faq",
        resource_type: "image",
      });
    } else {
      const file = (await request.formData()).get("file");

      if (
        !file ||
        typeof file === "string" ||
        !file.type.startsWith("image/")
      ) {
        return NextResponse.json(
          { error: "Choose an image file." },
          { status: 400 },
        );
      }

      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Image must be 5 MB or smaller." },
          { status: 400 },
        );
      }

      const bytes = Buffer.from(await file.arrayBuffer());
      const dataUri = `data:${file.type};base64,${bytes.toString("base64")}`;

      image = await cloudinary.uploader.upload(dataUri, {
        folder: "bexon/faq",
        resource_type: "image",
      });
    }

    return NextResponse.json({
      url: image.secure_url,
      publicId: image.public_id,
    });
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
