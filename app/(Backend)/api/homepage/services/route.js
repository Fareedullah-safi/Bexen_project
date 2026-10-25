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

const languages = ["en", "fa", "ps"];

const error = (message, status = 400) =>
  NextResponse.json({ success: false, error: message }, { status });

const translate = (value) =>
  typeof value === "string"
    ? { en: value, fa: "", ps: "" }
    : Object.fromEntries(
        languages.map((lang) => [
          lang,
          typeof value?.[lang] === "string" ? value[lang] : "",
        ]),
      );

const validId = (id) => typeof id === "string" && mongoose.isValidObjectId(id);

async function destroyImage(publicId) {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
  } catch (err) {
    console.error("Cloudinary destroy failed:", err);
  }
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

    const solutions = body.solutions.map((item) => ({
      ...(validId(item.id) ? { _id: item.id } : {}),
      title: translate(item.title),
      description: translate(item.description),
      image: item.image || "",
      publicId: item.publicId || "",
    }));

    for (const item of solutions) {
      if (!languages.some((lang) => item.title[lang].trim()))
        return error("Each solution needs a title");

      if (!languages.some((lang) => item.description[lang].trim()))
        return error("Each solution needs a description");

      if (!!item.image !== !!item.publicId)
        return error("Image and public ID must match");
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
      { new: true, upsert: true, runValidators: true },
    );

    const currentPublicIds = new Set(
      solutions.map((item) => item.publicId).filter(Boolean),
    );

    const oldPublicIds = (previous?.solutions || [])
      .map((item) => item.publicId)
      .filter((id) => id && !currentPublicIds.has(id));

    await Promise.all(oldPublicIds.map(destroyImage));

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

    if (!validId(cardId)) return error("Invalid solution ID");

    const data = await Solutions.findOne({
      "solutions._id": cardId,
    });

    if (!data) return error("Solution not found", 404);

    if (data.solutions.length <= 1)
      return error("At least one solution is required");

    const solution = data.solutions.find(
      (item) => item._id.toString() === cardId,
    );

    await Solutions.updateOne(
      { _id: data._id },
      { $pull: { solutions: { _id: cardId } } },
    );

    await destroyImage(solution?.publicId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete solution failed:", err);
    return error("Failed to delete solution", 500);
  }
}
