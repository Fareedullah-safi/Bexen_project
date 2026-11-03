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

// Helper: Deeply extract EVERY publicId from ANY block structure
function getAllPublicIds(obj, acc = []) {
  if (!obj || typeof obj !== "object") return acc;

  if (Array.isArray(obj)) {
    for (const item of obj) getAllPublicIds(item, acc);
  } else {
    for (const [key, value] of Object.entries(obj)) {
      if (
        (key === "publicId" || key === "public_id") &&
        typeof value === "string" &&
        value.trim()
      ) {
        acc.push(value.trim());
      } else if (typeof value === "object" && value !== null) {
        getAllPublicIds(value, acc);
      }
    }
  }
  return acc;
}

// Destroy all images on Cloudinary
async function deleteBlockImages(blocks = []) {
  const publicIds = [...new Set(getAllPublicIds(blocks))];

  for (const publicId of publicIds) {
    try {
      await cloudinary.uploader.destroy(publicId, { invalidate: true });
      console.log(`Cloudinary destroyed: ${publicId}`);
    } catch (err) {
      console.error(
        `Failed to destroy Cloudinary image (${publicId}):`,
        err.message,
      );
    }
  }
}

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

export async function DELETE(req, { params }) {
  try {
    const permission = await requireDeletePermission();
    if (!permission.authorized) return permission.response;

    await connectMongo();
    const { id } = await params;

    const page = await Page.findByIdAndDelete(id);

    if (page) {
      // 1. Destroy ALL images on Cloudinary across all blocks
      await deleteBlockImages(page.blocks);

      // 2. Remove page link from NavMenu
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

      revalidatePath("/", "layout");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
