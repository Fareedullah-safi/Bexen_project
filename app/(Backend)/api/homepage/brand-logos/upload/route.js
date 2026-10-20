import { NextResponse } from "next/server";
import cloudinary from "@/Lib/cloudinary";
import { requireEditPermission } from "@/Lib/AdminPermission/adminPermissions";


export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];

export async function POST(request) {
  try {
const permission = await requireEditPermission();

if (!permission.authorized) {
  return permission.response;
}

    const formData = await request.formData();
    const ids = formData.getAll("ids");

    if (!ids.length) {
      return NextResponse.json(
        { success: false, error: "No logos received." },
        { status: 400 },
      );
    }

    const logos = [];

    for (const rawId of ids) {
      const id = Number(rawId);

      if (![1, 2, 3].includes(id)) {
        return NextResponse.json(
          { success: false, error: `Invalid logo ID: ${rawId}` },
          { status: 400 },
        );
      }

      const file = formData.get(`file_${id}`);
      const externalUrl = String(formData.get(`url_${id}`) || "").trim();

      let uploaded;

      // Upload a selected file.
      if (file && typeof file !== "string" && file.size > 0) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          throw new Error(`Logo ${id}: Unsupported image type.`);
        }

        if (file.size > MAX_FILE_SIZE) {
          throw new Error(`Logo ${id}: Image must be under 5MB.`);
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        uploaded = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "brand-logos",
              resource_type: "image",
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            },
          );

          stream.end(buffer);
        });
      } else if (externalUrl) {
        // Download and upload the external image to Cloudinary.
        let parsedUrl;

        try {
          parsedUrl = new URL(externalUrl);
        } catch {
          throw new Error(`Logo ${id}: Invalid image URL.`);
        }

        if (
          !["https:", "http:"].includes(parsedUrl.protocol) ||
          parsedUrl.username ||
          parsedUrl.password
        ) {
          throw new Error(`Logo ${id}: Invalid image URL.`);
        }

        const response = await fetch(parsedUrl, {
          signal: AbortSignal.timeout(15000),
          redirect: "follow",
        });

        if (!response.ok) {
          throw new Error(
            `Logo ${id}: Could not download the external image (${response.status}).`,
          );
        }

        const contentType = (response.headers.get("content-type") || "")
          .split(";")[0]
          .trim()
          .toLowerCase();

        if (!ALLOWED_TYPES.includes(contentType)) {
          throw new Error(
            `Logo ${id}: The URL did not return a supported image.`,
          );
        }

        const arrayBuffer = await response.arrayBuffer();

        if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
          throw new Error(`Logo ${id}: Image must be under 5MB.`);
        }

        if (arrayBuffer.byteLength === 0) {
          throw new Error(`Logo ${id}: The downloaded image is empty.`);
        }

        const buffer = Buffer.from(arrayBuffer);

        uploaded = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "brand-logos",
              resource_type: "image",
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            },
          );

          stream.end(buffer);
        });
      } else {
        // Ignore empty optional logo slots.
        continue;
      }

      logos.push({
        id,
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
      });
    }

    return NextResponse.json({
      success: true,
      logos,
    });
  } catch (error) {
    console.error("Brand logo Cloudinary upload error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to upload logos to Cloudinary.",
      },
      { status: 500 },
    );
  }
}
