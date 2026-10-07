import connectDB from "@/Lib/mongoDB";
import brandLogos from "@/Models/brand-logos";
import cloudinary from "@/Lib/cloudinary";
import { buffer } from "node:stream/consumers";
import { rejects } from "node:assert";

export async function POST(request) {
  try {
    const formData = await request.formData();

    const title = formData.get("title");
    const ids = formData.getAll("ids");
    const files = formData.getAll("files");
    const urls = formData.getAll("urls");

    console.log("Title:", title);
    console.log("IDs:", ids);
    console.log("Files:", files);
    console.log("URLs:", urls);

    //cloudinary
    const file = files[0];
    if (!file) {
      return Response.json(
        {
          status: 404,
        },
        {
          success: false,
          error: "No file found",
        },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "bexon/brand-logos",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );

      uploadStream.end(buffer);
    });

    console.log("Cloudinary:", result);

    return Response.json({
      success: true,
      title,
      ids,
      fileCount: files.length,
      urls,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { success: false, error: "Something went wrong" },
      { status: 500 },
    );
  }
}
