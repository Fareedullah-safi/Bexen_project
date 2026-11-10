import {
  requireDeletePermission,
  requireEditPermission,
} from "@/Lib/AdminPermission/adminPermissions";
import cloudinary from "@/Lib/cloudinary";
import dbConnect from "@/Lib/mongoDB";
import HomeSlider from "@/Models/HomeSlider";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    let doc = await HomeSlider.findOne();
    if (!doc) {
      doc = await HomeSlider.create({ slides: [] });
    }
    return NextResponse.json({ success: true, slides: doc.slides || [] });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const permission = await requireEditPermission();
    if (!permission.authorized) {
      return permission.response;
    }

    await dbConnect();
    const body = await req.json();
    const slides = Array.isArray(body.slides) ? body.slides : [];

    // Destroy Cloudinary assets removed from the list
    const current = await HomeSlider.findOne();
    if (current && Array.isArray(current.slides)) {
      const keepIds = new Set();
      for (let i = 0; i < slides.length; i++) {
        if (slides[i] && slides[i].publicId) {
          keepIds.add(slides[i].publicId);
        }
      }

      for (let i = 0; i < current.slides.length; i++) {
        const pid = current.slides[i].publicId;
        if (pid && !keepIds.has(pid)) {
          try {
            await cloudinary.uploader.destroy(pid);
          } catch (err) {}
        }
      }
    }

    const updated = await HomeSlider.findOneAndUpdate(
      {},
      { slides: slides },
      { new: true, upsert: true, runValidators: true },
    );

    return NextResponse.json({
      success: true,
      message: "Slides saved successfully",
      slides: updated.slides || [],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(req) {
  try {
    const permission = await requireDeletePermission();
    if (!permission.authorized) {
      return permission.response;
    }

    await dbConnect();
    const body = await req.json();
    const id = body.id || body.slideId;
    const publicId = body.publicId;

    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {}
    }

    const updated = await HomeSlider.findOneAndUpdate(
      {},
      { $pull: { slides: { $or: [{ id: id }, { publicId: publicId }] } } },
      { new: true },
    );

    return NextResponse.json({
      success: true,
      message: "Slide deleted successfully",
      slides: updated ? updated.slides : [],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
