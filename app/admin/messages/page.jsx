"use client";

import Spinner from "@/app/Components/Admin/Spinner";
import axios from "axios";
import {
  Briefcase,
  Calendar,
  Inbox,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const API_URL = "/api/homepage/contact"; // Adjust this if your API route is named differently

export default function ContactMessagesAdmin() {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(API_URL);
      // Handle standard array or { data: [...] } structure
      const d = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setMessages(d);
    } catch (error) {
      toast.error("Failed to load messages.");
    } finally {
      setLoading(false);
    }
  };

  // DIRECT DELETE - No modals, no confirms.
  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await axios.delete(`${API_URL}?id=${id}`);
      setMessages((prev) => prev.filter((msg) => msg._id !== id));
      toast.success("Message deleted.");
    } catch (error) {
      toast.error("Failed to delete message.");
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

  // Reusable classes matching your exact theme
  const displayBoxClass =
    "w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--foreground)] transition-all duration-300";
  const labelClass =
    "mb-1.5 block text-xs font-semibold text-[var(--muted)] flex items-center gap-1.5";

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto max-w-6xl space-y-5">
        {/* HEADER */}
        <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start lg:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-[var(--accent)] uppercase">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              Inbox & Communications
            </div>
            <h1 className="text-2xl font-bold sm:text-3xl">Contact Messages</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Review and manage direct inquiries from your website clients.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <div className="inline-flex w-full flex-wrap items-center gap-1.5 rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-1.5 shadow-sm sm:w-auto">
              <div className="flex min-h-10 items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-[var(--accent)]">
                <MessageSquare size={18} />
                Total Inquiries: {messages.length}
              </div>
            </div>
          </div>
        </header>

        {/* MESSAGES LIST */}
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4 sm:px-6">
            <div className="flex items-center gap-2">
              <Inbox size={18} className="text-[var(--accent)]" />
              <h2 className="font-semibold">Messages ({messages.length})</h2>
            </div>
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            {messages.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-[var(--border)] py-14 text-center">
                <MessageSquare
                  className="mx-auto mb-3 text-[var(--muted)] opacity-50"
                  size={40}
                />
                <p className="text-sm text-[var(--muted)]">
                  No messages received yet.
                </p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isDeleting = deletingId === msg._id;

                return (
                  <article
                    key={msg._id}
                    className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm transition-all hover:border-[var(--accent)]/30"
                  >
                    {/* Message Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 sm:px-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/10 text-sm font-bold text-[var(--accent)]">
                          {msg.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-[var(--accent)]">
                            {msg.fullName}
                          </span>
                          <span className="ml-3 hidden items-center gap-1 text-xs text-[var(--muted)] sm:inline-flex">
                            <Calendar size={12} />
                            {new Date(msg.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* DIRECT DELETE BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleDelete(msg._id)}
                          disabled={isDeleting}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>

                    {/* Message Details */}
                    <div className="space-y-4 p-4 sm:p-5">
                      <div className="grid gap-4 sm:grid-cols-3">
                        {/* Email */}
                        <div>
                          <label className={labelClass}>
                            <Mail size={14} className="text-[var(--accent)]" />
                            Email Address
                          </label>
                          <div className={displayBoxClass}>
                            <a
                              href={`mailto:${msg.email}`}
                              className="hover:text-[var(--accent)] hover:underline"
                            >
                              {msg.email}
                            </a>
                          </div>
                        </div>

                        {/* Phone */}
                        <div>
                          <label className={labelClass}>
                            <Phone size={14} className="text-[var(--accent)]" />
                            Phone Number
                          </label>
                          <div className={displayBoxClass}>
                            <a
                              href={`tel:${msg.phone}`}
                              className="hover:text-[var(--accent)] hover:underline"
                            >
                              {msg.phone}
                            </a>
                          </div>
                        </div>

                        {/* Service */}
                        <div>
                          <label className={labelClass}>
                            <Briefcase
                              size={14}
                              className="text-[var(--accent)]"
                            />
                            Service Required
                          </label>
                          <div className={displayBoxClass}>
                            {msg.service || "N/A"}
                          </div>
                        </div>
                      </div>

                      {/* Message Content */}
                      <div>
                        <label className={labelClass}>
                          <MessageSquare
                            size={14}
                            className="text-[var(--accent)]"
                          />
                          Message Content
                        </label>
                        <div
                          className={`${displayBoxClass} min-h-[100px] leading-relaxed whitespace-pre-wrap`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
