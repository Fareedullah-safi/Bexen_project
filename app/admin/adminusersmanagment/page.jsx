"use client";

import Spinner from "@/app/Components/Admin/Spinner";
import axios from "axios";
import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Shield,
  ShieldAlert,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const API_URL = "/api/admin/adminusers/addAdmin";

const ROLES = [
  { value: "super-admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
];

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

// ==========================================
// Permission check helper
// ==========================================
async function verifyAdminPermission() {
  try {
    const res = await fetch("/api/admin/cloudinary/verify", {
      cache: "no-store",
    });
    const data = await res.json();
    if (res.ok && data && data.success === true) {
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

export default function AdminsManager() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [reset, setReset] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // --- Verify permission on mount ---
  useEffect(() => {
    const checkPermission = async () => {
      setCheckingAuth(true);
      const allowed = await verifyAdminPermission();
      setAuthorized(allowed);
      setCheckingAuth(false);

      if (!allowed) {
        toast.error("You don't have permission to manage admins.");
      }
    };
    checkPermission();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      if (res.data?.success) setAdmins(res.data.data || []);
      else toast.error(res.data?.msg || "Failed to load admins.");
    } catch {
      toast.error("Failed to load admins from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleRoleChange = async (id, newRole) => {
    if (!authorized) {
      toast.error("You don't have permission to edit admins.");
      return;
    }
    setSavingId(id);
    try {
      const res = await axios.patch(API_URL, { id, role: newRole });
      if (!res.data?.success) throw new Error(res.data?.msg || "Update failed");
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
      loadAdmins();
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id, name) => {
    if (!authorized) {
      toast.error("You don't have permission to delete admins.");
      return;
    }
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

  const submitReset = async () => {
    if (!authorized) {
      toast.error("You don't have permission to reset passwords.");
      return;
    }
    if (!reset?.password || reset.password.length < 6)
      return toast.error("Min 6 characters.");
    setReset((r) => ({ ...r, loading: true }));
    try {
      const res = await axios.patch(API_URL, {
        id: reset.id,
        password: reset.password,
      });
      if (!res.data?.success) throw new Error(res.data?.msg || "Failed.");
      toast.success(`Password reset for "${reset.name}".`);
      setReset(null);
    } catch (e) {
      toast.error(
        e.response?.data?.msg || e.message || "Failed to reset password.",
      );
      setReset((r) => ({ ...r, loading: false }));
    }
  };

  if (checkingAuth || loading) {
    return (
      <div className="flex min-h-96 items-center justify-center bg-[var(--background)]">
        <Spinner />
      </div>
    );
  }

  // --- Not authorized: show blocked view ---
  if (!authorized) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="mx-auto max-w-6xl space-y-6">
          <header>
            <p className="mb-1 text-[11px] font-bold tracking-[0.2em] text-[var(--accent)] uppercase">
              Access Control
            </p>
            <h1 className="text-2xl font-bold sm:text-3xl">Admins Manager</h1>
          </header>

          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-500/30 bg-red-500/5 px-6 py-20 text-center">
            <ShieldAlert size={48} className="text-red-500 opacity-70" />
            <h2 className="text-lg font-bold text-red-500">Access Denied</h2>
            <p className="max-w-md text-sm text-[var(--muted)]">
              You don&apos;t have permission to manage admin users. Only
              authorized administrators can view and edit this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <p className="mb-1 text-[11px] font-bold tracking-[0.2em] text-[var(--accent)] uppercase">
            Access Control
          </p>
          <h1 className="text-2xl font-bold sm:text-3xl">Admins Manager</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Manage admin users, assign roles, or remove access.
          </p>
        </header>

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
                        <td className="px-4 py-4 font-mono text-xs text-[var(--muted)]">
                          {user.email}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`hidden rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize sm:inline-block ${roleBadge(currentRole)}`}
                            >
                              {currentRole}
                            </span>
                            <div className="relative">
                              <select
                                value={currentRole}
                                disabled={savingId === user._id || !authorized}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val !== currentRole)
                                    handleRoleChange(user._id, val);
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
                              {savingId === user._id && (
                                <Loader2
                                  size={14}
                                  className="absolute top-1/2 -right-5 -translate-y-1/2 animate-spin text-[var(--accent)]"
                                />
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs text-[var(--muted)]">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-4 py-4 text-right sm:px-6">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              disabled={!authorized}
                              onClick={() =>
                                setReset({
                                  id: user._id,
                                  name: user.name,
                                  email: user.email,
                                  password: "",
                                  show: false,
                                  loading: false,
                                })
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)]/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <KeyRound size={15} />
                              <span className="hidden sm:inline">Reset</span>
                            </button>
                            <button
                              type="button"
                              disabled={deletingId === user._id || !authorized}
                              onClick={() => handleDelete(user._id, user.name)}
                              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId === user._id ? (
                                <Loader2 size={15} className="animate-spin" />
                              ) : (
                                <Trash2 size={15} />
                              )}
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
          <Shield size={15} className="text-[var(--accent)]" />
          <span>
            <b>Super Admin</b>: Full system access · <b>Admin</b>: Manage
            content & media · <b>Editor</b>: Edit content · <b>Viewer</b>:
            Read-only access
          </span>
        </div>
      </div>

      {/* RESET PASSWORD MODAL */}
      {reset && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !reset.loading && setReset(null)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => !reset.loading && setReset(null)}
              className="absolute top-4 right-4 rounded-lg p-1 text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              <X size={18} />
            </button>
            <h3 className="mb-1 text-lg font-bold">Reset Password</h3>
            <p className="mb-5 text-xs text-[var(--muted)]">
              New password for{" "}
              <b className="text-[var(--foreground)]">{reset.name}</b>
            </p>
            <div className="mb-2 text-xs text-[var(--muted)]">
              Email: {reset.email}
            </div>
            <div className="relative mb-5">
              <input
                type={reset.show ? "text" : "password"}
                value={reset.password}
                onChange={(e) =>
                  setReset((r) => ({ ...r, password: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && submitReset()}
                placeholder="New password (min 6 chars)"
                disabled={reset.loading}
                autoFocus
                className="w-full rounded-xl border-2 border-[var(--border)] bg-[var(--background)] px-4 py-2.5 pr-10 text-sm outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/20 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setReset((r) => ({ ...r, show: !r.show }))}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
                tabIndex={-1}
              >
                {reset.show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReset(null)}
                disabled={reset.loading}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-[var(--muted)] hover:bg-[var(--accent)]/10 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitReset}
                disabled={
                  reset.loading || reset.password.length < 6 || !authorized
                }
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {reset.loading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <KeyRound size={15} />
                )}
                {reset.loading ? "Saving..." : "Reset"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
