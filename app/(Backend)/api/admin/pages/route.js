import connectMongo from "@/Lib/mongoDB";
import NavMenu from "@/Models/NavBar/NavBar";
import Page from "@/Models/Pages/Page";
import { NextResponse } from "next/server";
import {
  requireDeletePermission,
  requireEditPermission,
} from "@/Lib/AdminPermission/adminPermissions";
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
    await connectMongo();
    const body = await req.json();

    // 1. Create Page
    const page = await Page.create(body);

    // 2. Insert into NavMenu schema
    if (body.showInNav) {
      let menu = await NavMenu.findOne();
      if (!menu) menu = await NavMenu.create({ items: [] });

      const pageHref = `/${page.slug}`;
      const childId = `nav_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      const newNavItem = {
        id: childId,
        href: pageHref,
        showInFooter: Boolean(page.showInFooter),
        translations: {
          en: { label: page.title },
          ps: { label: page.title },
          fa: { label: page.title },
        },
      };

      if (body.navParent) {
        // Place as child under selected parent ID
        menu.items = menu.items.map((item) => {
          if (item.id === body.navParent) {
            return {
              ...item,
              hasDropdown: true,
              children: [...(item.children || []), newNavItem],
            };
          }
          return item;
        });
      } else {
        // Add as new top-level nav item
        menu.items.push({
          ...newNavItem,
          hasDropdown: false,
          children: [],
        });
      }

      await NavMenu.updateOne({}, { $set: { items: menu.items } });
    }

    return NextResponse.json({ success: true, page });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
