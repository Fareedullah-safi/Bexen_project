import dbConnect from "@/Lib/mongoDB";
import Backup from "@/Models/Backup/Backup";
import Page from "@/Models/Pages/Page";
import { NextResponse } from "next/server";

/* ── GET: list all backups (newest first) ── */
export async function GET() {
  try {
    await dbConnect();
    const backups = await Backup.find({})
      .select("name pageCount note createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: backups });
  } catch (error) {
    console.error("Backup list error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

/* ── POST: create a new backup OR restore / delete ── */
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { action } = body;

    /* ───────── CREATE BACKUP ───────── */
    if (action === "create") {
      const pages = await Page.find({}).lean();

      // Strip mongoose internals so restore stays clean
      const cleanPages = pages.map((p) => {
        const { __v, ...rest } = p;
        return rest;
      });

      const backup = await Backup.create({
        name: body.name || `Backup ${new Date().toLocaleString()}`,
        note: body.note || "",
        pages: cleanPages,
        pageCount: cleanPages.length,
      });

      return NextResponse.json({
        success: true,
        message: "Backup saved to database",
        data: {
          _id: backup._id,
          name: backup.name,
          pageCount: backup.pageCount,
          createdAt: backup.createdAt,
        },
      });
    }

    /* ───────── RESTORE BACKUP ───────── */
    if (action === "restore") {
      if (!body.backupId) {
        return NextResponse.json(
          { success: false, message: "backupId is required" },
          { status: 400 },
        );
      }

      const backup = await Backup.findById(body.backupId).lean();
      if (!backup) {
        return NextResponse.json(
          { success: false, message: "Backup not found" },
          { status: 404 },
        );
      }

      // 1. Wipe current pages
      await Page.deleteMany({});

      // 2. Insert pages from backup (keep original _id)
      if (backup.pages?.length) {
        await Page.insertMany(backup.pages, { ordered: false });
      }

      return NextResponse.json({
        success: true,
        message: `Restored ${backup.pageCount} page(s) from "${backup.name}"`,
      });
    }

    /* ───────── DELETE BACKUP ───────── */
    if (action === "delete") {
      if (!body.backupId) {
        return NextResponse.json(
          { success: false, message: "backupId is required" },
          { status: 400 },
        );
      }

      await Backup.findByIdAndDelete(body.backupId);

      return NextResponse.json({
        success: true,
        message: "Backup deleted",
      });
    }

    return NextResponse.json(
      { success: false, message: "Unknown action" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Backup POST error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
