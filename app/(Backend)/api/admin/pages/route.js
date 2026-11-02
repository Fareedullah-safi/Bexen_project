import { requireEditPermission } from "@/Lib/AdminPermission/adminPermissions";
import connectMongo from "@/Lib/mongoDB";
import NavMenu from "@/Models/NavBar/NavBar";
import Page from "@/Models/Pages/Page";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectMongo();
    const pages = await Page.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, pages });
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

    await connectMongo();
    const body = await req.json();

    // 1. Create Page Document
    const page = await Page.create(body);

    // 2. Insert into NavMenu Document
    if (body.showInNav) {
      let menu = await NavMenu.findOne();
      if (!menu) {
        menu = await NavMenu.create({ items: [] });
      }

      const pageHref = `/${page.slug}`;
      const newNavId = `nav_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      const newNavItem = {
        id: newNavId,
        href: pageHref,
        showInFooter: Boolean(page.showInFooter),
        translations: {
          en: { label: page.title },
          ps: { label: page.title },
          fa: { label: page.title },
        },
      };

      const hasParent =
        body.navParent &&
        body.navParent !== "none" &&
        body.navParent !== "null" &&
        body.navParent.trim() !== "";

      let addedToParent = false;

      if (hasParent) {
        // Find parent item in items array and append to children
        menu.items = menu.items.map((item) => {
          if (item.id === body.navParent) {
            addedToParent = true;
            return {
              ...item,
              hasDropdown: true,
              children: [...(item.children || []), newNavItem],
            };
          }
          return item;
        });
      }

      // If no parent selected OR parent ID not found -> Add as Top-Level Main Item
      if (!hasParent || !addedToParent) {
        menu.items.push({
          ...newNavItem,
          hasDropdown: false,
          children: [],
        });
      }

      // Save updated NavMenu
      await NavMenu.updateOne(
        { _id: menu._id },
        { $set: { items: menu.items } },
      );
    }

    return NextResponse.json({ success: true, page });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
