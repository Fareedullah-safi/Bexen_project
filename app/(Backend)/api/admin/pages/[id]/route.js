import {
  requireDeletePermission,
  requireEditPermission,
} from "@/Lib/AdminPermission/adminPermissions";
import cloudinary from "@/Lib/cloudinary";
import connectMongo from "@/Lib/mongoDB";
import NavMenu from "@/Models/NavBar/NavBar";
import Page from "@/Models/Pages/Page";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

// Helper: Delete images from Cloudinary
async function deleteBlockImages(blocks = []) {
  for (const block of blocks) {
    const data = block.data || {};
    // Gather all image publicIds from blocks
    const publicIds = [
      data.heroImage?.publicId,
      data.en?.publicId,
      data.ps?.publicId,
      data.fa?.publicId,
    ].filter(Boolean);

    for (const publicId of publicIds) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error("Cloudinary delete error:", err.message);
      }
    }
  }
}

// 1. GET Single Page
export async function GET(req, { params }) {
  try {
    await connectMongo();
    const { id } = await params;
    const page = await Page.findById(id);

    if (!page) {
      return NextResponse.json({ message: "Page not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, page });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// 2. PUT Update Page
export async function PUT(req, { params }) {
  try {
    const permission = await requireEditPermission();
    if (!permission.authorized) return permission.response;

    await connectMongo();
    const { id } = await params;
    const body = await req.json();

    const page = await Page.findByIdAndUpdate(id, body, { new: true });
    if (!page) {
      return NextResponse.json({ message: "Page not found" }, { status: 404 });
    }

    revalidatePath("/", "layout");
    return NextResponse.json({ success: true, page });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// 3. DELETE Page, Images & Navbar Link
export async function DELETE(req, { params }) {
  try {
    const permission = await requireDeletePermission();
    if (!permission.authorized) return permission.response;

    await connectMongo();
    const { id } = await params;

    // Delete page document
    const page = await Page.findByIdAndDelete(id);

    if (page) {
      // Step A: Delete Cloudinary images
      await deleteBlockImages(page.blocks);

      // Step B: Remove link from Navbar
      const pageHref = `/${page.slug}`;
      const menu = await NavMenu.findOne();

      if (menu && menu.items) {
        const updatedItems = menu.items
          .filter((item) => item.href !== pageHref)
          .map((item) => ({
            ...item,
            children: (item.children || []).filter(
              (child) => child.href !== pageHref,
            ),
            hasDropdown:
              (item.children || []).filter((child) => child.href !== pageHref)
                .length > 0,
          }));

        await NavMenu.updateOne(
          { _id: menu._id },
          { $set: { items: updatedItems } },
        );
      }

      // Step C: Refresh homepage header
      revalidatePath("/", "layout");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
