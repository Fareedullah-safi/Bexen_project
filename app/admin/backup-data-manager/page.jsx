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

  /* ── Load list ── */
  const fetchBackups = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/backup");
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setBackups(json.data || []);
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

  /* ── Create backup (saves ALL pages into DB) ── */
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

      toast.success("Backup saved in database!");
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

  /* ── Restore ── */
  const handleRestore = async (backup) => {
    const ok = window.confirm(
      `⚠️ This will REPLACE all current pages with backup:\n\n"${backup.name}"\n(${backup.pageCount} pages)\n\nContinue?`,
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

      toast.success(json.message || "Restored successfully!");
      // Reload so admin UI shows restored pages
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Restore failed");
      setRestoringId(null);
    }
  };

  /* ── Delete backup record ── */
  const handleDelete = async (backup) => {
    const ok = window.confirm(
      `Delete backup "${backup.name}"?\nThis only deletes the backup, not your live pages.`,
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
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
          <Database size={20} />
        </div>
        <div>
          <h2 className="text-base font-bold text-[var(--foreground)]">
            Database Backup
          </h2>
          <p className="mt-0.5 text-sm text-[var(--muted)]">
            Save all pages into the database. Restore anytime without losing
            your real data.
          </p>
        </div>
      </div>

      {/* Create form */}
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
            placeholder="e.g. Before testing News block"
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
              <LoaderCircle size={16} className="animate-spin" /> Saving to
              DB...
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
            No backups yet. Click &quot;Save Backup to Database&quot; first.
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
