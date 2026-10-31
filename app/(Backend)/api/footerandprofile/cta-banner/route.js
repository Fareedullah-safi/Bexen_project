import { requireEditPermission } from "@/Lib/AdminPermission/adminPermissions";
import cloudinary from "@/Lib/cloudinary";
import connectDB from "@/Lib/mongoDB";
import CtaBanner from "@/Models/CtaBanner/CtaBanner";
import { NextResponse } from "next/server";

// 1. GET: Send data to the frontend
export async function GET() {
  await connectDB();
  let banner = await CtaBanner.findOne();

  // If no banner exists yet, create an empty one
  if (!banner) {
    banner = await CtaBanner.create({});
  }

  return NextResponse.json({ success: true, data: banner });
}

// 2. POST: Save changes from Admin Panel
export async function POST(req) {
    const permission = await requireEditPermission();
  
    if (!permission.authorized) {
      return permission.response;
    }
  await connectDB();
  const body = await req.json();

  // If Admin wants to delete an image
  if (body.action === "destroy_image") {
    await cloudinary.uploader.destroy(body.publicId);
    return NextResponse.json({ success: true });
  }

  // Save text & image updates to database
  const updatedBanner = await CtaBanner.findOneAndUpdate(
    {}, // Find the first one
    { $set: body }, // Update it
    { returnDocument: "after", upsert: true }, // Create if missing
  );

  return NextResponse.json({ success: true, data: updatedBanner });
}
