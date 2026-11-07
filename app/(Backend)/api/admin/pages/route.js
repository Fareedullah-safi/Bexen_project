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

    // Validate required fields
    if (!body.title?.trim() || !body.slug?.trim()) {
      return NextResponse.json(
        { success: false, message: "Title and slug are required." },
        { status: 400 },
      );
    }

    // Prepare language translations
    const translations = {
      en: {
        title: body.translations?.en?.title?.trim() || body.title.trim(),
      },
      ps: {
        title: body.translations?.ps?.title?.trim() || "",
      },
      fa: {
        title: body.translations?.fa?.title?.trim() || "",
      },
    };

    // 1. Create Page Document
    const page = await Page.create({
      ...body,
      title: translations.en.title,
      translations,
    });

    // 2. Insert into NavMenu Document
    if (page.showInNav) {
      let menu = await NavMenu.findOne();

      if (!menu) {
        menu = await NavMenu.create({ items: [] });
      }

      const pageHref = `/${page.slug}`;

      const newNavId = `nav_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 6)}`;

      const newNavItem = {
        id: newNavId,
        href: pageHref,
        showInFooter: Boolean(page.showInFooter),

        // Use the correct title for each language
        translations: {
          en: { label: translations.en.title },
          ps: { label: translations.ps.title },
          fa: { label: translations.fa.title },
        },
      };

      const hasParent =
        body.navParent &&
        body.navParent !== "none" &&
        body.navParent !== "null" &&
        body.navParent.trim() !== "";

      let addedToParent = false;

      if (hasParent) {
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

      // Add as top-level item if no valid parent exists
      if (!hasParent || !addedToParent) {
        menu.items.push({
          ...newNavItem,
          hasDropdown: false,
          children: [],
        });
      }

      await NavMenu.updateOne(
        { _id: menu._id },
        { $set: { items: menu.items } },
      );
    }

    return NextResponse.json({
      success: true,
      page,
    });
  } catch (error) {
    console.error("CREATE PAGE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 },
    );
  }
}
