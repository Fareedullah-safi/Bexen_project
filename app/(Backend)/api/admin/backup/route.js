import connectMongo from "@/Lib/mongoDB";
import Backup from "@/Models/Backup/Backup";
import NavMenu from "@/Models/NavBar/NavBar";
import Page from "@/Models/Pages/Page";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await connectMongo();

    const backups = await Backup.find({})
      .select("_id name note pageCount navbar createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const formatted = backups.map((b) => ({
      _id: b._id.toString(),
      name: b.name,
      note: b.note,
      pageCount: b.pageCount || 0,
      hasNavbar: !!b.navbar,
      createdAt: b.createdAt,
    }));

    return NextResponse.json({
      success: true,
      backups: formatted,
      data: formatted, // alias so either `json.backups` or `json.data` works
    });
  } catch (error) {
    console.error("[Backup GET Error]:", error);
    return NextResponse.json(
      { success: false, message: error.message, error: error.message },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    await connectMongo();

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const { action, name, note, backupId } = body || {};

    // ==========================================
    // STEP 1: CREATE BACKUP (Pages First, then Navbar)
    // ==========================================
    if (action === "create") {
      if (!name || !name.trim()) {
        return NextResponse.json(
          { success: false, message: "Backup name is required" },
          { status: 400 },
        );
      }

      // 1A. Fetch and serialize Pages cleanly
      const rawPages = await Page.find({}).lean();
      const cleanPages = JSON.parse(JSON.stringify(rawPages));

      // 1B. Fetch and serialize Navbar cleanly
      const rawNav = await NavMenu.findOne({}).lean();
      let cleanNav = null;
      if (rawNav) {
        cleanNav = JSON.parse(JSON.stringify(rawNav));
        delete cleanNav._id;
        delete cleanNav.__v;
        delete cleanNav.createdAt;
        delete cleanNav.updatedAt;
      } else {
        console.warn(
          "[Backup Create]: NavMenu.findOne({}) returned null - no navbar found in the database",
        );
      }

      // 1C. Store into Backup model in MongoDB
      const newBackup = await Backup.create({
        name: name.trim(),
        note: note ? note.trim() : "",
        pages: cleanPages,
        pageCount: cleanPages.length,
        navbar: cleanNav,
      });

      const navbarSaved = !!newBackup.navbar;

      console.log(
        `[Backup Created]: Pages count=${cleanPages.length}, Navbar found=${!!cleanNav}, Navbar saved=${navbarSaved}`,
      );

      return NextResponse.json({
        success: true,
        message: navbarSaved
          ? `Backup created (${cleanPages.length} pages + navbar)`
          : `Backup created (${cleanPages.length} pages, but NO navbar was saved)`,
        navbarSaved,
        backup: newBackup,
      });
    }

    // ==========================================
    // STEP 2: RESTORE BACKUP (Pages First, then Navbar)
    // ==========================================
    if (action === "restore") {
      if (!backupId) {
        return NextResponse.json(
          { success: false, message: "Backup ID required" },
          { status: 400 },
        );
      }

      const backup = await Backup.findById(backupId).lean();
      if (!backup) {
        return NextResponse.json(
          { success: false, message: "Backup not found" },
          { status: 404 },
        );
      }

      // --- 2A. RESTORE PAGES FIRST ---
      await Page.deleteMany({});
      if (backup.pages && backup.pages.length > 0) {
        const cleanPagesToInsert = JSON.parse(JSON.stringify(backup.pages));
        await Page.insertMany(cleanPagesToInsert);
      }

      // --- 2B. RESTORE NAVBAR SAFELY SECOND ---
      let navbarRestored = false;
      if (backup.navbar) {
        const cleanNavToInsert = JSON.parse(JSON.stringify(backup.navbar));
        delete cleanNavToInsert._id;
        delete cleanNavToInsert.__v;
        delete cleanNavToInsert.createdAt;
        delete cleanNavToInsert.updatedAt;

        await NavMenu.deleteMany({});
        await NavMenu.create(cleanNavToInsert);
        navbarRestored = true;
      }

      console.log(
        `[Backup Restored]: Pages=${backup.pages?.length || 0}, Navbar=${navbarRestored}`,
      );

      return NextResponse.json({
        success: true,
        message: navbarRestored
          ? `Restored ${backup.pages?.length || 0} pages and navbar successfully`
          : `Restored ${backup.pages?.length || 0} pages (this backup has no navbar, so the navbar was left unchanged)`,
        details: {
          pagesRestored: backup.pages?.length || 0,
          navbarRestored,
        },
      });
    }

    // ==========================================
    // STEP 3: DELETE BACKUP
    // ==========================================
    if (action === "delete") {
      if (!backupId) {
        return NextResponse.json(
          { success: false, message: "Backup ID required" },
          { status: 400 },
        );
      }

      await Backup.findByIdAndDelete(backupId);
      return NextResponse.json({
        success: true,
        message: "Backup deleted successfully",
      });
    }

    // ==========================================
    // STEP 4: EMERGENCY NAVBAR REBUILD FROM PAGES
    // ==========================================
    if (action === "sync-navbar") {
      const pages = await Page.find({
        showInNav: { $ne: false },
        status: "published",
      }).lean();

      const newItems = pages.map((page) => ({
        id: `nav_${page._id.toString()}`,
        href: page.slug === "home" ? "/" : `/${page.slug}`,
        hasDropdown: false,
        showInFooter: false,
        translations: {
          en: { label: page.title?.en || "" },
          ps: { label: page.title?.ps || "" },
          fa: { label: page.title?.fa || "" },
        },
        children: [],
      }));

      const existingNav = await NavMenu.findOne({});
      if (existingNav) {
        existingNav.items = newItems;
        await existingNav.save();
      } else {
        await NavMenu.create({ items: newItems });
      }

      return NextResponse.json({
        success: true,
        message: "Navbar rebuilt successfully from live pages",
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 },
    );
  } catch (error) {
    console.error("[Backup POST Error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 },
    );
  }
}
