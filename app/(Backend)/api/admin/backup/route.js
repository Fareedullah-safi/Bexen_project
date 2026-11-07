import mongoose from "mongoose";
import { NextResponse } from "next/server";

import {
  requireDeletePermission,
  requireEditPermission,
} from "@/Lib/AdminPermission/adminPermissions";
import connectMongo from "@/Lib/mongoDB";
import Backup from "@/Models/Backup/Backup";
import NavMenu from "@/Models/NavBar/NavBar";
import Page from "@/Models/Pages/Page";

export const dynamic = "force-dynamic";

const MAX_AUTO_BACKUPS = 5; // how many automatic "before restore" backups to keep

const reply = (body, status = 200) => NextResponse.json(body, { status });
const toPlain = (doc) => JSON.parse(JSON.stringify(doc));

function cleanNavbar(nav) {
  if (!nav) return null;
  const copy = toPlain(nav);
  delete copy._id;
  delete copy.__v;
  delete copy.createdAt;
  delete copy.updatedAt;
  return copy;
}

// Reads the current live pages + navbar
async function readLiveSite() {
  const pages = toPlain(await Page.find({}).lean());
  const navbar = cleanNavbar(await NavMenu.findOne({}).lean());
  return { pages, navbar };
}

// Saves the current live site as a backup
async function saveBackup({ name, note = "", kind = "manual" }) {
  const { pages, navbar } = await readLiveSite();

  const backup = await Backup.create({
    name,
    note,
    kind,
    pages,
    pageCount: pages.length,
    navbar,
  });

  if (kind === "auto") {
    const old = await Backup.find({ kind: "auto" })
      .sort({ createdAt: -1 })
      .skip(MAX_AUTO_BACKUPS)
      .select("_id")
      .lean();
    if (old.length) {
      await Backup.deleteMany({ _id: { $in: old.map((b) => b._id) } });
    }
  }

  return { backup, pages, navbar };
}

// Puts pages (and navbar, if there is one) onto the live site
async function applyData({ pages, navbar }) {
  await Page.deleteMany({});
  if (pages?.length) await Page.insertMany(pages);

  const nav = cleanNavbar(navbar);
  if (nav) {
    await NavMenu.deleteMany({});
    await NavMenu.create(nav);
  }
}

export async function GET() {
  // NOTE: protect /api/admin/* with your admin login (middleware).
  try {
    await connectMongo();

    const backups = await Backup.find({})
      .select("-pages")
      .sort({ createdAt: -1 })
      .lean();

    return reply({
      success: true,
      backups: backups.map((b) => ({
        _id: b._id.toString(),
        name: b.name,
        note: b.note || "",
        kind: b.kind || "manual",
        pageCount: b.pageCount || 0,
        hasNavbar: !!b.navbar,
        createdAt: b.createdAt,
      })),
    });
  } catch (error) {
    console.error("[Backup GET Error]:", error);
    return reply({ success: false, message: "Server error" }, 500);
  }
}

export async function POST(req) {
  // NOTE: protect /api/admin/* with your admin login (middleware).
  try {
    const permission = await requireEditPermission();

    if (!permission.authorized) {
      return permission.response;
    }
    await connectMongo();

    let body;
    try {
      body = await req.json();
    } catch {
      return reply({ success: false, message: "Invalid JSON body" }, 400);
    }

    const { action, name, note, backupId } = body || {};

    // ---------- CREATE ----------
    if (action === "create") {
      if (!name || !name.trim()) {
        return reply(
          { success: false, message: "Backup name is required" },
          400,
        );
      }

      const { backup, pages } = await saveBackup({
        name: name.trim(),
        note: note ? note.trim() : "",
      });

      const navbarSaved = !!backup.navbar;
      console.log(
        `[Backup Created]: pages=${pages.length}, navbar=${navbarSaved}`,
      );

      return reply({
        success: true,
        navbarSaved,
        message: navbarSaved
          ? `Backup created (${pages.length} pages + navbar)`
          : `Backup created (${pages.length} pages, but NO navbar was found in the database)`,
      });
    }

    // ---------- RESTORE ----------
    if (action === "restore") {
      if (!mongoose.isValidObjectId(backupId)) {
        return reply(
          { success: false, message: "Valid backup ID required" },
          400,
        );
      }

      const backup = await Backup.findById(backupId).lean();
      if (!backup) {
        return reply({ success: false, message: "Backup not found" }, 404);
      }
      if (!backup.pages?.length) {
        return reply(
          {
            success: false,
            message:
              "This backup has no pages, so restoring it would empty your site. Nothing was changed.",
          },
          422,
        );
      }

      // 1. Save the current site first (if this fails, nothing is touched)
      const safety = await saveBackup({
        name: `Auto: before restoring "${backup.name}"`.slice(0, 120),
        note: "Created automatically before a restore",
        kind: "auto",
      });

      // 2. Restore. If anything fails, put the old site back.
      try {
        await applyData({ pages: backup.pages, navbar: backup.navbar });
      } catch (error) {
        console.error("[Backup Restore Error]:", error);
        try {
          await applyData(safety);
          return reply(
            {
              success: false,
              message:
                "Restore failed, but your site was put back exactly as it was. Nothing was lost.",
            },
            500,
          );
        } catch (rollbackError) {
          console.error("[Backup Rollback Error]:", rollbackError);
          return reply(
            {
              success: false,
              message: `Restore failed and the automatic rollback failed too. Restore the backup named "${safety.backup.name}" from the list now.`,
            },
            500,
          );
        }
      }

      const navbarRestored = !!backup.navbar;
      console.log(
        `[Backup Restored]: pages=${backup.pages.length}, navbar=${navbarRestored}`,
      );

      return reply({
        success: true,
        message: navbarRestored
          ? `Restored ${backup.pages.length} pages and the navbar. Your previous content was saved as an automatic backup.`
          : `Restored ${backup.pages.length} pages. This backup has no navbar, so the navbar was left unchanged.`,
      });
    }

    // ---------- DELETE ----------
    if (action === "delete") {
      if (!mongoose.isValidObjectId(backupId)) {
        return reply(
          { success: false, message: "Valid backup ID required" },
          400,
        );
      }
      const permission = await requireDeletePermission();

      if (!permission.authorized) {
        return permission.response;
      }
      const deleted = await Backup.findByIdAndDelete(backupId);
      if (!deleted) {
        return reply({ success: false, message: "Backup not found" }, 404);
      }
      return reply({ success: true, message: "Backup deleted successfully" });
    }

    return reply({ success: false, message: "Invalid action" }, 400);
  } catch (error) {
    console.error("[Backup POST Error]:", error);
    return reply(
      { success: false, message: "Server error. Check the server logs." },
      500,
    );
  }
}
