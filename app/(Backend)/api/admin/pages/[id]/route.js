import {
  requireDeletePermission,
  requireEditPermission,
} from "@/Lib/AdminPermission/adminPermissions";
import connectMongo from "@/Lib/mongoDB";
import NavMenu from "@/Models/NavBar/NavBar";
import Page from "@/Models/Pages/Page";
import { NextResponse } from "next/server";

// GET Single Page
export async function GET(req, { params }) {
  try {
    await connectMongo();
    const { id } = await params;
    const page = await Page.findById(id);
    if (!page) {
      return NextResponse.json(
        { success: false, message: "Page not found" },
        { status: 404 },
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

// PUT Update Page
export async function PUT(req, { params }) {
  try {
    const permission = await requireEditPermission();
    if (!permission.authorized) return permission.response;

    await connectMongo();
    const { id } = await params;
    const body = await req.json();

    const page = await Page.findByIdAndUpdate(id, body, { new: true });
    if (!page) {
      return NextResponse.json(
        { success: false, message: "Page not found" },
        { status: 404 },
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

// DELETE Page & Remove from NavMenu
export async function DELETE(req, { params }) {
  try {
    const permission = await requireDeletePermission();
    if (!permission.authorized) return permission.response;

    await connectMongo();
    const { id } = await params;
    const page = await Page.findByIdAndDelete(id);

    if (page) {
      const pageHref = `/${page.slug}`;
      let menu = await NavMenu.findOne();

      if (menu && menu.items) {
        // Scrub page from top-level items and children
        const updatedItems = menu.items
          .filter((item) => item.href !== pageHref)
          .map((item) => {
            const updatedChildren = (item.children || []).filter(
              (child) => child.href !== pageHref,
            );
            return {
              ...item,
              hasDropdown: updatedChildren.length > 0,
              children: updatedChildren,
            };
          });

        await NavMenu.updateOne(
          { _id: menu._id },
          { $set: { items: updatedItems } },
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
