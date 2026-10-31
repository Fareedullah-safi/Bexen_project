import cloudinary from "@/Lib/cloudinary";
import connectMongo from "@/Lib/mongoDB";
import NavMenu from "@/Models/NavBar/NavBar";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectMongo();
    let menu = await NavMenu.findOne().lean();
    if (!menu) menu = await NavMenu.create({ items: [] });
    return NextResponse.json(menu);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectMongo();
    const body = await req.json();

    // destroy image only
    if (body.publicId && !body.items && body.logo === undefined) {
      await cloudinary.uploader.destroy(body.publicId);
      return NextResponse.json({ success: true });
    }

    delete body._id;
    const updated = await NavMenu.findOneAndUpdate(
      {},
      { $set: body },
      { new: true, upsert: true },
    );
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
