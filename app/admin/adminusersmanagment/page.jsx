"use client";

import Spinner from "@/app/Components/Admin/Spinner";
import axios from "axios";
import { Loader2, Shield, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const API_URL = "/api/admin/adminusers/addAdmin";

// 4 Role Options
const ROLES = [
  { value: "super-admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
];

// Color badge for each role
const roleBadge = (role) => {
  switch (role) {
    case "super-admin":
      return "bg-purple-500/15 text-purple-600 border-purple-500/30";
    case "admin":
      return "bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/30";
    case "editor":
      return "bg-blue-500/15 text-blue-600 border-blue-500/30";
    case "viewer":
    default:
      return "bg-slate-500/15 text-slate-600 border-slate-500/30";
  }
};

export default function AdminsManager() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [admins, setAdmins] = useState([]);

  // Fetch all admins
  const loadAdmins = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      if (res.data?.success) {
        setAdmins(res.data.data || []);
      } else {
        toast.error(res.data?.msg || "Failed to load admins.");
      }
    } catch {
      toast.error("Failed to load admins from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  // Update role handler
  const handleRoleChange = async (id, newRole) => {
    setSavingId(id);
    try {
      const res = await axios.patch(API_URL, { id, role: newRole });
      if (!res.data?.success) throw new Error(res.data?.msg || "Update failed");

      // Update local state immediately
      setAdmins((prev) =>
        prev.map((u) =>
          u._id === id ? { ...u, role: res.data.data.role } : u,
        ),
      );
      toast.success(`Role updated to "${newRole}"`);
    } catch (e) {
      toast.error(
        e.response?.data?.msg || e.message || "Failed to update role",
      );
      // Reload to revert UI if failed
      loadAdmins();
    } finally {
      setSavingId(null);
    }
  };

  // Delete admin handler
  const handleDelete = async (id, name) => {
    setDeletingId(id);
    try {
      const res = await axios.delete(`${API_URL}?id=${id}`);
      if (!res.data?.success) throw new Error(res.data?.msg || "Delete failed");

      setAdmins((prev) => prev.filter((u) => u._id !== id));
      toast.success("Admin deleted successfully.");
    } catch (e) {
      toast.error(
        e.response?.data?.msg || e.message || "Failed to delete admin",
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center bg-[var(--background)]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* HEADER */}
        <header>
          <p className="mb-1 text-[11px] font-bold tracking-[0.2em] text-[var(--accent)] uppercase">
            Access Control
          </p>
          <h1 className="text-2xl font-bold sm:text-3xl">Admins Manager</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Manage admin users, assign roles, or remove access.
          </p>
        </header>

        {/* ADMINS LIST TABLE */}
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-4 sm:px-6">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-[var(--accent)]" />
              <h2 className="font-bold">All Admins ({admins.length})</h2>
            </div>
          </div>

          {admins.length === 0 ? (
            <div className="px-4 py-16 text-center text-[var(--muted)] sm:px-6">
              No admins found in database.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-[var(--border)] bg-[var(--surface-soft)]/60 text-xs tracking-wide text-[var(--muted)] uppercase">
                  <tr>
                    <th className="px-4 py-3 font-semibold sm:px-6">Name</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Created</th>
                    <th className="px-4 py-3 text-right font-semibold sm:px-6">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((user) => {
                    const currentRole = user.role || "viewer";

                    return (
                      <tr
                        key={user._id}
                        className="border-b border-[var(--border)] transition-colors last:border-0 hover:bg-[var(--accent)]/5"
                      >
                        {/* Avatar & Name */}
                        <td className="px-4 py-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)]/15 text-sm font-bold text-[var(--accent)] shadow-sm">
                              {(user.name || "?").charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-[var(--foreground)]">
                              {user.name}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-4 py-4 font-mono text-xs text-[var(--muted)]">
                          {user.email}
                        </td>

                        {/* Teal Styled Role Select Dropdown */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {/* Role Badge Indicator */}
                            <span
                              className={`hidden rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize sm:inline-block ${roleBadge(
                                currentRole,
                              )}`}
                            >
                              {currentRole}
                            </span>

                            {/* Dropdown Input */}
                            <div className="relative">
                              <select
                                value={currentRole}
                                disabled={savingId === user._id}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val !== currentRole) {
                                    handleRoleChange(user._id, val);
                                  }
                                }}
                                className="cursor-pointer rounded-xl border-2 border-[var(--accent)]/30 bg-[var(--surface)] px-3 py-1.5 text-xs font-bold text-[var(--foreground)] shadow-sm transition-all outline-none hover:border-[var(--accent)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/20 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {ROLES.map((r) => (
                                  <option
                                    key={r.value}
                                    value={r.value}
                                    className="bg-[var(--surface)] py-1 font-semibold text-[var(--foreground)]"
                                  >
                                    {r.label}
                                  </option>
                                ))}
                              </select>

                              {/* Loading Spinner during role save */}
                              {savingId === user._id && (
                                <Loader2
                                  size={14}
                                  className="absolute top-1/2 -right-5 -translate-y-1/2 animate-spin text-[var(--accent)]"
                                />
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Created Date */}
                        <td className="px-4 py-4 text-xs text-[var(--muted)]">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "—"}
                        </td>

                        {/* Delete Button */}
                        <td className="px-4 py-4 text-right sm:px-6">
                          <button
                            type="button"
                            disabled={deletingId === user._id}
                            onClick={() => handleDelete(user._id, user.name)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                          >
                            {deletingId === user._id ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ROLE LEGEND */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
          <Shield size={15} className="text-[var(--accent)]" />
          <span>
            <b>Super Admin</b>: Full system access · <b>Admin</b>: Manage
            content & media · <b>Editor</b>: Edit content · <b>Viewer</b>:
            Read-only access
          </span>
        </div>
      </div>
    </div>
  );
}
