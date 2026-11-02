import dbConnect from "@/Lib/mongoDB";
import NavMenu from "@/Models/NavBar/NavBar";
import Page from "@/Models/Pages/Page";
import { NextResponse } from "next/server";
import {
  requireDeletePermission,
  requireEditPermission,
} from "@/Lib/AdminPermission/adminPermissions";

// === GET SINGLE PAGE (For the Flat Editor) ===
export async function GET(req, { params }) {
  try {
    await dbConnect();
    const resolvedParams = await params; // Next.js 15 requirement

    const page = await Page.findById(resolvedParams.id);
    if (!page)
      return NextResponse.json(
        { success: false, message: "Page not found" },
        { status: 404 },
      );

    return NextResponse.json({ success: true, page });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// === UPDATE PAGE (Save Draft / Publish) ===
export async function PUT(req, { params }) {
  try {
        const permission = await requireEditPermission();
    
        if (!permission.authorized) {
          return permission.response;
        }
    await dbConnect();
    const resolvedParams = await params;

    const body = await req.json();
    const updatedPage = await Page.findByIdAndUpdate(resolvedParams.id, body, {
      new: true,
    });

    if (!updatedPage)
      return NextResponse.json(
        { success: false, message: "Page not found" },
        { status: 404 },
      );

    return NextResponse.json({ success: true, page: updatedPage });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// === DELETE PAGE ===
export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const resolvedParams = await params;

    const page = await Page.findByIdAndDelete(resolvedParams.id);
    if (!page)
      return NextResponse.json(
        { success: false, message: "Page not found" },
        { status: 404 },
      );

    // Scrub dead links from Navbar!
    if (page.slug) {
      const href = `/${page.slug}`;
      // Remove if top-level tab
      await NavMenu.findOneAndDelete({ href });
      // Remove if child in a dropdown
      await NavMenu.updateMany({}, { $pull: { children: { href } } });
    }

    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
