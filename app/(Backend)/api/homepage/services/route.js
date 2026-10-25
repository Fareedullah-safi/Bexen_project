import {
  requireDeletePermission,
  requireEditPermission,
} from "@/Lib/AdminPermission/adminPermissions";
import cloudinary from "@/Lib/cloudinary";
import connectDB from "@/Lib/mongoDB";
import Solutions from "@/Models/Services";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const error = (message, status = 400) =>
  NextResponse.json({ success: false, error: message }, { status });

const translate = (value) => ({
  en: typeof value === "string" ? value : value?.en || "",
  fa: typeof value === "string" ? "" : value?.fa || "",
  ps: typeof value === "string" ? "" : value?.ps || "",
});

async function destroyImage(publicId) {
  if (publicId)
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
}

export async function GET() {
  try {
    await connectDB();
    const data = await Solutions.findOne().lean();
    return NextResponse.json({ success: true, data });
  } catch {
    return error("Failed to load solutions", 500);
  }
}

export async function POST(req) {
  try {
    const permission = await requireEditPermission();
    if (!permission.authorized) return error("Unauthorized", 403);

    await connectDB();

    const body = await req.json();
    const previous = await Solutions.findOne();

    if (!Array.isArray(body.solutions) || !body.solutions.length)
      return error("Add at least one solution");

    const solutions = [];

    for (const item of body.solutions) {
      const title = translate(item.title);
      const description = translate(item.description);

      if (!title.en.trim() && !title.fa.trim() && !title.ps.trim())
        return error("Every solution needs a title");

      if (
        !description.en.trim() &&
        !description.fa.trim() &&
        !description.ps.trim()
      )
        return error("Every solution needs a description");

      if (!!item.image !== !!item.publicId)
        return error("Image and public ID must match");

      const solution = {
        title,
        description,
        image: item.image || "",
        publicId: item.publicId || "",
      };

      if (mongoose.isValidObjectId(item.id)) solution._id = item.id;

      solutions.push(solution);
    }

    const data = await Solutions.findOneAndUpdate(
      {},
      {
        badge: translate(body.badge),
        headingOne: translate(body.headingOne),
        headingTwo: translate(body.headingTwo),
        highlight: translate(body.highlight),
        solutions,
      },
      { returnDocument: "after", upsert: true, runValidators: true },
    );

    if (previous) {
      for (const old of previous.solutions) {
        let stillUsed = false;

        for (const current of solutions) {
          if (current.publicId === old.publicId) stillUsed = true;
        }

        if (old.publicId && !stillUsed) await destroyImage(old.publicId);
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Save solutions failed:", err);
    return error("Failed to save solutions", 500);
  }
}

export async function DELETE(req) {
  try {
    const permission = await requireDeletePermission();
    if (!permission.authorized) return error("Unauthorized", 403);

    await connectDB();

    const { cardId } = await req.json();

    if (!mongoose.isValidObjectId(cardId)) return error("Invalid solution ID");

    const data = await Solutions.findOne({
      "solutions._id": cardId,
    });

    if (!data) return error("Solution not found", 404);

    if (data.solutions.length <= 1)
      return error("At least one solution is required");

    const solution = data.solutions.id(cardId);

    await Solutions.updateOne(
      { _id: data._id },
      { $pull: { solutions: { _id: cardId } } },
    );

    try {
      await destroyImage(solution?.publicId);
    } catch (err) {
      console.error("Cloudinary deletion failed:", err);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete solution failed:", err);
    return error("Failed to delete solution", 500);
  }
}
