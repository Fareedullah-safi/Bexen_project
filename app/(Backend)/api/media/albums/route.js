import { requireEditPermission } from "@/Lib/AdminPermission/adminPermissions";
import cloudinary from "@/Lib/cloudinary";
import connectDB from "@/Lib/mongoDB";
import GalleryAlbum from "@/Models/Media/Albums/AblumsSection";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    let doc = await GalleryAlbum.findOne().lean();
    if (!doc) {
      doc = await GalleryAlbum.create({
        translations: {
          en: {
            title: "Photo Albums",
            subtitle: "Explore our image collections.",
          },
          ps: {
            title: "د انځورونو البومونه",
            subtitle: "زموږ د انځورونو ټولګې وګورئ.",
          },
          fa: {
            title: "آلبوم‌های عکس",
            subtitle: "مجموعه‌های تصاویر ما را مشاهده کنید.",
          },
        },
        albums: [],
      });
    }
    return NextResponse.json({ success: true, data: doc });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch albums." },
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
    await connectDB();
    const body = await req.json();

    // Single Cloudinary image destruction handler
    if (body.publicId && !body.albums) {
      try {
        await cloudinary.uploader.destroy(body.publicId);
      } catch (e) {
        console.warn("Cloudinary delete warning:", e.message);
      }
      return NextResponse.json({ success: true, message: "Image destroyed." });
    }

    let doc = await GalleryAlbum.findOne();
    if (!doc) doc = new GalleryAlbum();

    doc.translations = body.translations || doc.translations;
    doc.albums = Array.isArray(body.albums) ? body.albums : [];

    await doc.save();
    return NextResponse.json({ success: true, data: doc });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to save albums." },
      { status: 500 },
    );
  }
}
