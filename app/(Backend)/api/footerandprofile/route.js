import cloudinary from "@/Lib/cloudinary";
import connectMongo from "@/Lib/mongoDB";
import Footer from "@/Models/Footer/Footer";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectMongo();
    let footer = await Footer.findOne().lean();
    if (!footer) footer = await Footer.create({});
    return NextResponse.json(footer);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectMongo();
    const body = await req.json();

    // 1. If request is ONLY to delete the logo
    if (body.publicId && !body.projectName) {
      await cloudinary.uploader.destroy(body.publicId);
      return NextResponse.json({ success: true });
    }

    // 2. Normal save: Update database
    delete body._id;
    const updated = await Footer.findOneAndUpdate(
      {},
      { $set: body },
      { upsert: true, returnDocument: "after" },
    );
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
