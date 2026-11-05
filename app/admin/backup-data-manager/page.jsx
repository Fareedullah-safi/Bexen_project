"use client";

import { Database, LoaderCircle, RotateCcw, Save, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function BackupManager() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restoringId, setRestoringId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");

  const fetchBackups = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/backup", { cache: "no-store" });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to load");
      setBackups(json.backups || json.data || []);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to load backups");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          name: name.trim() || `Backup ${new Date().toLocaleString()}`,
          note: note.trim(),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      if (json.navbarSaved === false) {
        toast.warning(json.message || "Backup saved, but no navbar was found");
      } else {
        toast.success(json.message || "Backup saved");
      }
      setName("");
      setNote("");
      fetchBackups();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Backup failed");
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async (backup) => {
    const ok = window.confirm(
      `⚠️ RESTORE will replace:\n\n` +
        `• All pages\n` +
        (backup.hasNavbar
          ? `• Full navbar menu\n\n`
          : `• (Navbar stays unchanged - none saved in this backup)\n\n`) +
        `Backup: "${backup.name}" (${backup.pageCount} pages)\n\n` +
        `Any pages${backup.hasNavbar ? "/menu items" : ""} added after this backup will be removed.\n\nContinue?`,
    );
    if (!ok) return;

    setRestoringId(backup._id);
    try {
      const res = await fetch("/api/admin/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "restore",
          backupId: backup._id,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      toast.success(json.message || "Restored successfully");
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Restore failed");
      setRestoringId(null);
    }
  };

  const handleDelete = async (backup) => {
    const ok = window.confirm(
      `Delete backup "${backup.name}"?\n\nThis only deletes the backup snapshot.\nLive pages and navbar stay safe.`,
    );
    if (!ok) return;

    setDeletingId(backup._id);
    try {
      const res = await fetch("/api/admin/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          backupId: backup._id,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      toast.success("Backup deleted");
      fetchBackups();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
          <Database size={20} />
        </div>
        <div>
          <h2 className="text-base font-bold text-[var(--foreground)]">
            Database Backup
          </h2>
          <p className="mt-0.5 text-sm text-[var(--muted)]">
            Saves <strong>all pages</strong> and the{" "}
            <strong>full navbar</strong> into the database. Restore puts both
            back exactly — extra pages and menu items added later are removed.
          </p>
        </div>
      </div>

      {/* Create */}
      <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Backup name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`Backup ${new Date().toLocaleString()}`}
            maxLength={120}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm transition-colors outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Note (optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Before testing new page"
            maxLength={240}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm transition-colors outline-none focus:border-[var(--accent)]"
          />
        </div>
        <button
          type="button"
          onClick={handleCreate}
          disabled={saving || restoringId !== null}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <>
              <LoaderCircle size={16} className="animate-spin" /> Saving pages +
              navbar...
            </>
          ) : (
            <>
              <Save size={16} /> Save Backup to Database
            </>
          )}
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-[var(--muted)]">
          Saved backups
        </h3>

        {loading ? (
          <div className="flex items-center gap-2 py-6 text-sm text-[var(--muted)]">
            <LoaderCircle size={16} className="animate-spin" /> Loading...
          </div>
        ) : backups.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--muted)]">
            No backups yet. Save one before you test.
          </div>
        ) : (
          <div className="space-y-2">
            {backups.map((b) => (
              <div
                key={b._id}
                className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                    {b.name}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    {formatDate(b.createdAt)} · {b.pageCount} page
                    {b.pageCount === 1 ? "" : "s"}
                    {b.hasNavbar ? " + navbar" : " · ⚠ no navbar saved"}
                    {b.note ? ` · ${b.note}` : ""}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRestore(b)}
                    disabled={restoringId !== null || saving}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {restoringId === b._id ? (
                      <>
                        <LoaderCircle size={14} className="animate-spin" />{" "}
                        Restoring...
                      </>
                    ) : (
                      <>
                        <RotateCcw size={14} /> Restore
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(b)}
                    disabled={
                      deletingId === b._id || restoringId !== null || saving
                    }
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === b._id ? (
                      <LoaderCircle size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
