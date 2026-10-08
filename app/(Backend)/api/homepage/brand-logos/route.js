import cloudinary from "@/Lib/cloudinary";

export async function POST(request) {
  try {
    const formData = await request.formData();

    const title = formData.get("title");
    const ids = formData.getAll("ids");
    const files = formData.getAll("files");
    const urls = formData.getAll("urls");
    const oldPublicIds = formData.getAll("oldPublicIds");

    const logos = [];

    // Process every logo
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const file = files[i];
      const url = urls[i];
      const oldPublicId = oldPublicIds[i];

      // Delete old Cloudinary image
      if (oldPublicId) {
        await cloudinary.uploader.destroy(oldPublicId);
      }

      let result;

      // Upload new PC image
      if (file instanceof File && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());

        result = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: "bexon/brand-logos",
              },
              (error, result) => {
                error ? reject(error) : resolve(result);
              },
            )
            .end(buffer);
        });
      }

      // Upload new image URL
      else if (url?.startsWith("http")) {
        result = await cloudinary.uploader.upload(url, {
          folder: "bexon/brand-logos",
        });
      }

      if (result) {
        logos.push({
          id: Number(id),
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    }

    return Response.json({
      success: true,
      title,
      logos,
    });
  } catch (error) {
    console.error("Upload error:", error);

    return Response.json(
      {
        success: false,
        error: "Upload failed",
      },
      { status: 500 },
    );
  }
}
