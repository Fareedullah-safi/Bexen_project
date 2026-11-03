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

// Recursively find every publicId / public_id in any object or array
function getAllPublicIds(input, acc = []) {
  if (!input || typeof input !== "object") return acc;

  // Convert Mongoose docs / subdocs to plain objects
  let obj = input;
  if (typeof input.toObject === "function") {
    try {
      obj = input.toObject({ depopulate: true });
    } catch {
      obj = input;
    }
  }

  if (Array.isArray(obj)) {
    for (const item of obj) getAllPublicIds(item, acc);
    return acc;
  }

  for (const [key, value] of Object.entries(obj)) {
    if (
      (key === "publicId" || key === "public_id") &&
      typeof value === "string" &&
      value.trim()
    ) {
      acc.push(value.trim());
    } else if (value && typeof value === "object") {
      getAllPublicIds(value, acc);
    }
  }
  return acc;
}

// Destroy a list of Cloudinary public IDs safely
async function destroyImages(publicIds = []) {
  const uniqueIds = [...new Set(publicIds.filter(Boolean))];

  for (const publicId of uniqueIds) {
    try {
      await cloudinary.uploader.destroy(publicId, { invalidate: true });
    } catch (err) {
      console.error(`Cloudinary destroy failed (${publicId}):`, err.message);
    }
  }
  return uniqueIds.length;
}

// Remove the deleted page from navbar (never block delete flow)
async function removePageFromNavbar(slug) {
  try {
    const pageHref = `/${String(slug || "").replace(/^\/+/, "")}`;
    const menu = await NavMenu.findOne();
    if (!menu || !Array.isArray(menu.items)) return;

    const cleaned = menu.items
      .filter((item) => item.href !== pageHref)
      .map((item) => {
        const children = (item.children || []).filter(
          (child) => child.href !== pageHref,
        );
        return {
          ...(typeof item.toObject === "function" ? item.toObject() : item),
          children,
          hasDropdown: children.length > 0,
        };
      });

    menu.items = cleaned;
    await menu.save();
  } catch (err) {
    console.error("Navbar cleanup failed:", err.message);
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

    const existingPage = await Page.findById(id);
    if (!existingPage) {
      return NextResponse.json({ message: "Page not found" }, { status: 404 });
    }

    // ONLY cleanup Cloudinary when blocks are actually sent in body.
    // Prevents partial PUT (title/slug only) from wiping all images.
    if (Array.isArray(body.blocks)) {
      const oldPublicIds = getAllPublicIds(existingPage.blocks || []);
      const newPublicIds = new Set(getAllPublicIds(body.blocks || []));
      const orphanedPublicIds = oldPublicIds.filter(
        (pid) => !newPublicIds.has(pid),
      );
      if (orphanedPublicIds.length > 0) {
        await destroyImages(orphanedPublicIds);
      }
    }

    // Partial-safe update: only sets fields that were actually sent
    const update = {};
    if (body.title !== undefined) update.title = body.title;
    if (body.slug !== undefined) update.slug = body.slug;
    if (body.status !== undefined) update.status = body.status;
    if (body.showInNav !== undefined) update.showInNav = body.showInNav;
    if (body.navParent !== undefined) update.navParent = body.navParent;
    if (body.showInFooter !== undefined)
      update.showInFooter = body.showInFooter;
    if (body.parent !== undefined) update.parent = body.parent;
    if (Array.isArray(body.blocks)) update.blocks = body.blocks;

    const page = await Page.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true },
    );

    try {
      revalidatePath("/", "layout");
    } catch (err) {
      console.error("revalidatePath failed:", err.message);
    }

    return NextResponse.json({ success: true, page });
  } catch (error) {
    console.error("PUT page error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const permission = await requireDeletePermission();
    if (!permission.authorized) return permission.response;

    await connectMongo();
    const { id } = await params;

    // 1) Load the page first so we have blocks + slug
    const page = await Page.findById(id);
    if (!page) {
      return NextResponse.json({
        success: true,
        message: "Page already deleted",
        deletedImages: 0,
      });
    }

    const plain = page.toObject ? page.toObject() : page;
    const publicIds = getAllPublicIds(plain.blocks || []);

    // 2) Delete Cloudinary images BEFORE removing the DB row
    const deletedCount = await destroyImages(publicIds);

    // 3) Delete page from DB
    await Page.findByIdAndDelete(id);

    // 4) Clean navbar (never fails the delete)
    await removePageFromNavbar(plain.slug);

    try {
      revalidatePath("/", "layout");
    } catch (err) {
      console.error("revalidatePath failed:", err.message);
    }

    return NextResponse.json({
      success: true,
      deletedImages: deletedCount,
    });
  } catch (error) {
    console.error("DELETE page error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
