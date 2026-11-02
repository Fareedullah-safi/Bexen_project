import connectMongo from "@/Lib/mongoDB";
import NavMenu from "@/Models/NavBar/NavBar";
import Page from "@/Models/Pages/Page";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectMongo();
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug)
      return NextResponse.json({ available: false, message: "Slug required" });

    const targetHref = `/${slug}`;

    // 1. Check Pages collection
    const pageExists = await Page.findOne({ slug });
    if (pageExists) {
      return NextResponse.json({
        available: false,
        message: "A page with this URL already exists.",
      });
    }

    // 2. Check NavMenu items array
    const menu = await NavMenu.findOne().lean();
    if (menu && Array.isArray(menu.items)) {
      const navExists = menu.items.some((item) => {
        if (item.href === targetHref) return true;
        if (Array.isArray(item.children)) {
          return item.children.some((child) => child.href === targetHref);
        }
        return false;
      });

      if (navExists) {
        return NextResponse.json({
          available: false,
          message: "This URL is already used in the Navbar menu.",
        });
      }
    }

    return NextResponse.json({ available: true });
  } catch (error) {
    return NextResponse.json(
      { available: false, message: error.message },
      { status: 500 },
    );
  }
}
