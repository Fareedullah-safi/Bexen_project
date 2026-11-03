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

function getAllPublicIds(input, acc = []) {
  if (!input || typeof input !== "object") return acc;

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

function toHref(slug) {
  return `/${String(slug || "").replace(/^\/+/, "")}`;
}

function plainItem(item) {
  return typeof item?.toObject === "function" ? item.toObject() : item;
}

// Remove page link from navbar (main + children)
async function removePageFromNavbar(slug) {
  try {
    const pageHref = toHref(slug);
    const menu = await NavMenu.findOne();
    if (!menu || !Array.isArray(menu.items)) return;

    const cleaned = menu.items
      .filter((item) => item.href !== pageHref)
      .map((item) => {
        const children = (item.children || []).filter(
          (child) => child.href !== pageHref,
        );
        return {
          ...plainItem(item),
          children,
          hasDropdown: children.length > 0,
        };
      });

    menu.items = cleaned;
    await menu.save();
  } catch (err) {
    console.error("Navbar remove failed:", err.message);
  }
}

// Add or update page link in navbar
async function syncPageToNavbar(page) {
  try {
    const showInNav = Boolean(page.showInNav);
    const slug = page.slug;
    const title = page.title || "Untitled";
    const href = toHref(slug);
    const showInFooter = Boolean(page.showInFooter);
    const navParent = page.navParent || "none";

    // If not showing in nav → just remove old link
    if (!showInNav) {
      await removePageFromNavbar(slug);
      // also remove old slug if renamed (handled by caller with oldSlug)
      return;
    }

    let menu = await NavMenu.findOne();
    if (!menu) {
      menu = await NavMenu.create({ items: [] });
    }

    // 1) Remove any old version of this href first (prevents duplicates)
    let items = (menu.items || [])
      .filter((item) => item.href !== href)
      .map((item) => {
        const children = (item.children || []).filter(
          (child) => child.href !== href,
        );
        return {
          ...plainItem(item),
          children,
          hasDropdown: children.length > 0,
        };
      });

    // 2) Build nav item
    const newItem = {
      id: `nav_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      href,
      showInFooter,
      translations: {
        en: { label: title },
        ps: { label: title },
        fa: { label: title },
      },
      hasDropdown: false,
      children: [],
    };

    // 3) Place under parent dropdown OR as main item
    const hasParent =
      navParent &&
      navParent !== "none" &&
      navParent !== "null" &&
      String(navParent).trim() !== "";

    let addedToParent = false;

    if (hasParent) {
      items = items.map((item) => {
        if (item.id === navParent) {
          addedToParent = true;
          const children = [...(item.children || []), newItem];
          return {
            ...plainItem(item),
            children,
            hasDropdown: true,
          };
        }
        return item;
      });
    }

    if (!hasParent || !addedToParent) {
      items.push(newItem);
    }

    menu.items = items;
    await menu.save();
  } catch (err) {
    console.error("Navbar sync failed:", err.message);
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

    const oldSlug = existingPage.slug;

    // Cloudinary cleanup only when blocks are sent
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

    // ===== NAVBAR SYNC ON PAGE UPDATE =====
    try {
      // If slug changed, remove OLD href first
      if (body.slug !== undefined && body.slug !== oldSlug) {
        await removePageFromNavbar(oldSlug);
      }

      // Then sync current page settings into navbar
      // (works for title/slug/showInNav/navParent/showInFooter changes)
      await syncPageToNavbar({
        title: page.title,
        slug: page.slug,
        showInNav: page.showInNav,
        navParent: page.navParent,
        showInFooter: page.showInFooter,
      });
    } catch (err) {
      console.error("Navbar update failed:", err.message);
    }

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

    const deletedCount = await destroyImages(publicIds);
    await Page.findByIdAndDelete(id);

    // Also remove from navbar when page is deleted
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
