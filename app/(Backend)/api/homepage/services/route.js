import { NextResponse } from "next/server";
import connectDB from "@/Lib/mongoDB";
import Solutions from "@/Models/Services";
import cloudinary from "@/Lib/cloudinary";

export const dynamic = "force-dynamic";

// Helper: Upload to Cloudinary
async function uploadToCloudinary(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "homepage/services" }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(buffer);
  });
}

// Helper: Delete from Cloudinary
async function deleteFromCloudinary(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
  }
}

/* ---------------- 1. GET: Load Data ---------------- */
export async function GET() {
  try {
    await connectDB();
    const data = await Solutions.findOne();
    return NextResponse.json({ success: true, data: data || null });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch data" },
      { status: 500 },
    );
  }
}

/* ---------------- 2. POST: Save & Upload ---------------- */
export async function POST(req) {
  try {
    await connectDB();
    const formData = await req.formData();

    const badge = formData.get("badge") || "";
    const headingOne = formData.get("headingOne") || "";
    const headingTwo = formData.get("headingTwo") || "";
    const highlight = formData.get("highlight") || "";

    const titles = formData.getAll("titles");
    const descriptions = formData.getAll("descriptions");
    const existingImages = formData.getAll("existingImages");
    const existingPublicIds = formData.getAll("existingPublicIds");
    const files = formData.getAll("files");

    if (titles.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please add at least one solution card" },
        { status: 400 },
      );
    }

    const solutions = [];
    let fileCounter = 0;

    for (let i = 0; i < titles.length; i++) {
      let imageUrl = existingImages[i] || "";
      let publicId = existingPublicIds[i] || "";

      const hasNewFile = formData.get(`hasFile_${i}`) === "true";

      if (hasNewFile) {
        const file = files[fileCounter];
        fileCounter++;

        if (file && file.size > 0) {
          if (publicId) await deleteFromCloudinary(publicId);

          const uploaded = await uploadToCloudinary(file);
          imageUrl = uploaded.secure_url;
          publicId = uploaded.public_id;
        }
      }

      solutions.push({
        title: titles[i],
        description: descriptions[i],
        image: imageUrl,
        publicId: publicId,
      });
    }

    const savedData = await Solutions.findOneAndUpdate(
      {},
      { badge, headingOne, headingTwo, highlight, solutions },
      { new: true, upsert: true },
    );

    return NextResponse.json({ success: true, data: savedData });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save" },
      { status: 500 },
    );
  }
}

/* ---------------- 3. DELETE: Using only MongoDB cardId ---------------- */
export async function DELETE(req) {
  try {
    await connectDB();
    const { cardId } = await req.json();

    if (!cardId) {
      return NextResponse.json(
        { success: false, error: "Card ID is required" },
        { status: 400 },
      );
    }

    // 1. Find document and locate the card to get its publicId
    const doc = await Solutions.findOne({ "solutions._id": cardId });

    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Card not found" },
        { status: 404 },
      );
    }

    const targetCard = doc.solutions.find(
      (card) => card._id.toString() === cardId.toString(),
    );

    // 2. Remove from Cloudinary if it had an uploaded image
    if (targetCard?.publicId) {
      await deleteFromCloudinary(targetCard.publicId);
    }

    // 3. Pull card from MongoDB array using its _id
    await Solutions.updateOne({}, { $pull: { solutions: { _id: cardId } } });

    return NextResponse.json({
      success: true,
      message: "Card deleted successfully",
    });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete card" },
      { status: 500 },
    );
  }
}
