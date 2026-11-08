"use client";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-6 text-sm text-[var(--muted)]">
      Loading editor…
    </div>
  ),
});

/* ══════════════════════════════════════════════════
   Register custom blots (runs once)
   ══════════════════════════════════════════════════ */
let blotsRegistered = false;

async function registerBlots() {
  if (blotsRegistered || typeof window === "undefined") return;
  try {
    const { default: Quill } = await import("quill");
    const Inline = Quill.import("blots/inline");

    /* ── 1. Inline Header (word-level H1–H6) ── */
    class InlineHeaderBlot extends Inline {
      static create(value) {
        const node = super.create();
        const level = value?.level || "3";
        node.dataset.level = level;
        const map = {
          1: { size: "2rem", weight: "700" },
          2: { size: "1.5rem", weight: "700" },
          3: { size: "1.25rem", weight: "600" },
          4: { size: "1.1rem", weight: "600" },
          5: { size: "1rem", weight: "600" },
          6: { size: "0.875rem", weight: "600" },
        };
        const s = map[level] || map["3"];
        node.style.fontSize = s.size;
        node.style.fontWeight = s.weight;
        node.style.lineHeight = "1.2";
        return node;
      }
      static formats(node) {
        return { level: node.dataset.level };
      }
    }
    InlineHeaderBlot.blotName = "inlineHeader";
    InlineHeaderBlot.tagName = "span";
    InlineHeaderBlot.className = "ql-inline-h";
    Quill.register(InlineHeaderBlot, true);

    /* ── 2. Highlight (word-level background) ── */
    class HighlightBlot extends Inline {
      static create(value) {
        const node = super.create();
        const c = value?.color || "#35B5B5";
        const s = value?.size || 4;
        node.dataset.hlColor = c;
        node.dataset.hlSize = String(s);
        node.style.backgroundColor = c;
        node.style.borderRadius = "4px";
        node.style.padding = `1px ${s}px`;
        return node;
      }
      static formats(node) {
        return { color: node.dataset.hlColor, size: node.dataset.hlSize };
      }
    }
    HighlightBlot.blotName = "highlight";
    HighlightBlot.tagName = "mark";
    HighlightBlot.className = "ql-hl";
    Quill.register(HighlightBlot, true);

    blotsRegistered = true;
  } catch (e) {
    console.warn("Blot registration failed:", e);
  }
}

/* ══════════════════════════════════════════════════
   Toolbar & Formats
   ══════════════════════════════════════════════════ */
const TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ script: "sub" }, { script: "super" }],
  [{ color: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["blockquote", "code-block"],
  [{ align: [] }],
  ["link"],
  ["clean"],
];

const FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "script",
  "color",
  "list",
  "blockquote",
  "code-block",
  "align",
  "link",
  "highlight",
  "inlineHeader",
  "break",
];

/* ══════════════════════════════════════════════════
   Component
   ══════════════════════════════════════════════════ */
export default function RichTextEditor({
  value = "",
  onChange,
  isRtl = false,
  error = false,
  placeholder = "Start typing...",
  minHeight = 150,
  disabled = false,
}) {
  const wrapperRef = useRef(null);
  const quillRef = useRef(null);
  const lastEmittedRef = useRef(value);
  const isSyncingRef = useRef(false);
  const enterBoundRef = useRef(false);

  const [ready, setReady] = useState(false);

  /* ── Highlight state ── */
  const [hlColor, setHlColor] = useState("#35B5B5");
  const [hlHex, setHlHex] = useState("#35B5B5");
  const [hlSize, setHlSize] = useState(4);

  /* ── Text color state ── */
  const [txtColor, setTxtColor] = useState("#1E8A8A");
  const [txtHex, setTxtHex] = useState("#1E8A8A");

  /* ── Register blots before mount ── */
  useEffect(() => {
    registerBlots().then(() => setReady(true));
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: TOOLBAR,
      clipboard: { matchVisual: false },
    }),
    [],
  );

  /* RTL + min-height */
  useEffect(() => {
    if (!wrapperRef.current) return;
    const el = wrapperRef.current.querySelector(".ql-editor");
    if (!el) return;
    el.setAttribute("dir", isRtl ? "rtl" : "ltr");
    el.style.textAlign = isRtl ? "right" : "left";
    el.style.minHeight = `${minHeight}px`;
  }, [isRtl, minHeight]);

  /*
    Enter     → insert <br>  (soft line break, same paragraph)
    Shift+Enter → new <p>   (real paragraph split)
    Must run AFTER Quill mounts, and our binding must be FIRST
    so it wins over Quill's default Enter handler.
  */
  useEffect(() => {
    if (!ready) return;
    if (enterBoundRef.current) return;

    let tries = 0;

    function bindEnterKey() {
      const quill = quillRef.current?.getEditor?.();
      if (!quill) {
        tries = tries + 1;
        if (tries < 20) {
          setTimeout(bindEnterKey, 50);
        }
        return;
      }

      if (enterBoundRef.current) return;
      enterBoundRef.current = true;

      // Enter = <br>
      quill.keyboard.addBinding({
        key: "Enter",
        shiftKey: false,
        handler: function (range) {
          if (!range) return false;

          quill.insertEmbed(range.index, "break", true, "user");
          quill.setSelection(range.index + 1, "silent");
          return false;
        },
      });

      // Shift+Enter = new paragraph
      quill.keyboard.addBinding({
        key: "Enter",
        shiftKey: true,
        handler: function (range) {
          if (!range) return false;

          quill.insertText(range.index, "\n", "user");
          quill.setSelection(range.index + 1, "silent");
          return false;
        },
      });

      // Move our Enter bindings to the FRONT so they run before Quill defaults
      const enterKeyCode = 13;
      const bindings = quill.keyboard.bindings[enterKeyCode];

      if (bindings && bindings.length > 2) {
        const shiftEnterBinding = bindings.pop();
        const enterBinding = bindings.pop();
        bindings.unshift(enterBinding);
        bindings.unshift(shiftEnterBinding);
      }
    }

    bindEnterKey();
  }, [ready]);

  /* External value sync */
  useEffect(() => {
    if (value === lastEmittedRef.current) return;
    const quill = quillRef.current?.getEditor?.();
    if (!quill) return;
    const cur = quill.root.innerHTML;
    const normCur = cur === "<p><br></p>" ? "" : cur;
    const normNext = value || "";
    if (normCur !== normNext) {
      lastEmittedRef.current = normNext;
      isSyncingRef.current = true;
      quill.clipboard.dangerouslyPasteHTML(normNext, "silent");
      isSyncingRef.current = false;
    }
  }, [value]);

  const handleChange = (html) => {
    if (isSyncingRef.current) return;
    const cleaned = html === "<p><br></p>" ? "" : html;
    if (cleaned === lastEmittedRef.current) return;
    lastEmittedRef.current = cleaned;
    onChange?.(cleaned);
  };

  /* ── Helper: get quill + selection ── */
  const getSelection = () => {
    const quill = quillRef.current?.getEditor?.();
    if (!quill) return null;
    const range = quill.getSelection(true);
    if (!range || range.length === 0) return null;
    return { quill, range };
  };

  /* ══════════════════════════════════════
     INLINE HEADER (word-level H1/H2/H3)
     ══════════════════════════════════════ */
  const applyInlineHeader = (level) => {
    const sel = getSelection();
    if (!sel) return;
    sel.quill.formatText(sel.range.index, sel.range.length, "inlineHeader", {
      level: String(level),
    });
  };

  const removeInlineHeader = () => {
    const sel = getSelection();
    if (!sel) return;
    sel.quill.formatText(
      sel.range.index,
      sel.range.length,
      "inlineHeader",
      false,
    );
  };

  /* ══════════════════════════════════════
     TEXT COLOR (hex-based, word-level)
     ══════════════════════════════════════ */
  const applyTextColor = () => {
    const sel = getSelection();
    if (!sel) return;
    sel.quill.formatText(sel.range.index, sel.range.length, "color", txtColor);
  };

  const removeTextColor = () => {
    const sel = getSelection();
    if (!sel) return;
    sel.quill.formatText(sel.range.index, sel.range.length, "color", false);
  };

  const handleTxtHex = (val) => {
    setTxtHex(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) setTxtColor(val);
  };
  const handleTxtPicker = (val) => {
    setTxtColor(val);
    setTxtHex(val);
  };

  /* ══════════════════════════════════════
     HIGHLIGHT (bg color, word-level)
     ══════════════════════════════════════ */
  const applyHighlight = () => {
    const sel = getSelection();
    if (!sel) return;
    sel.quill.formatText(sel.range.index, sel.range.length, "highlight", {
      color: hlColor,
      size: hlSize,
    });
  };

  const removeHighlight = () => {
    const sel = getSelection();
    if (!sel) return;
    sel.quill.formatText(sel.range.index, sel.range.length, "highlight", false);
  };

  const handleHlHex = (val) => {
    setHlHex(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) setHlColor(val);
  };
  const handleHlPicker = (val) => {
    setHlColor(val);
    setHlHex(val);
  };

  /* ── Loading ── */
  if (!ready) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-6 text-sm text-[var(--muted)]">
        Loading editor…
      </div>
    );
  }

  /* ── Shared button styles ── */
  const btnBase =
    "cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-colors";
  const btnPrimary = `${btnBase} bg-[var(--accent)] text-white hover:opacity-90`;
  const btnGhost = `${btnBase} border border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:bg-[var(--surface-soft)]`;
  const btnSmall =
    "flex h-6 w-6 cursor-pointer items-center justify-center rounded border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] hover:bg-[var(--surface-soft)]";
  const hexInput =
    "w-22 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1 font-mono text-xs outline-none focus:border-[var(--accent)]";
  const label = "text-xs font-medium text-[var(--muted)]";

  return (
    <div
      ref={wrapperRef}
      className={`rt-wrapper overflow-hidden rounded-xl border bg-[var(--background)] transition-colors focus-within:border-[var(--accent)] ${
        error ? "border-red-500" : "border-[var(--border)]"
      } ${disabled ? "pointer-events-none opacity-60" : ""}`}
    >
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value || ""}
        onChange={handleChange}
        modules={modules}
        formats={FORMATS}
        placeholder={placeholder}
        readOnly={disabled}
      />

      {!disabled && (
        <div className="space-y-0 border-t border-[var(--border)]">
          {/* ═══ ROW 1: Inline Header + Text Color ═══ */}
          <div className="flex flex-wrap items-center gap-2 bg-[var(--surface)] px-3 py-2">
            {/* Inline H1/H2/H3 */}
            <span className={label}>Word Heading:</span>
            <button
              type="button"
              onClick={() => applyInlineHeader(1)}
              className={btnGhost}
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => applyInlineHeader(2)}
              className={btnGhost}
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => applyInlineHeader(3)}
              className={btnGhost}
            >
              H3
            </button>
            <button
              type="button"
              onClick={removeInlineHeader}
              className={btnGhost}
            >
              ✕ Heading
            </button>

            <span className="mx-1 h-4 w-px bg-[var(--border)]" />

            {/* Text Color */}
            <span className={label}>Text Color:</span>
            <input
              type="color"
              value={txtColor}
              onChange={(e) => handleTxtPicker(e.target.value)}
              className="h-7 w-7 cursor-pointer rounded border border-[var(--border)] p-0"
              title="Pick text color"
            />
            <input
              type="text"
              value={txtHex}
              onChange={(e) => handleTxtHex(e.target.value)}
              maxLength={7}
              placeholder="#1E8A8A"
              className={hexInput}
            />
            <button
              type="button"
              onClick={applyTextColor}
              className={btnPrimary}
            >
              Apply
            </button>
            <button
              type="button"
              onClick={removeTextColor}
              className={btnGhost}
            >
              ✕ Color
            </button>

            <span className="text-[10px] text-[var(--muted)]">
              (select text first) · Enter = line break · Shift+Enter = new
              paragraph
            </span>
          </div>

          {/* ═══ ROW 2: Highlight (Background) ═══ */}
          <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] bg-[var(--surface)] px-3 py-2">
            <span className={label}>Highlight BG:</span>
            <input
              type="color"
              value={hlColor}
              onChange={(e) => handleHlPicker(e.target.value)}
              className="h-7 w-7 cursor-pointer rounded border border-[var(--border)] p-0"
              title="Pick highlight color"
            />
            <input
              type="text"
              value={hlHex}
              onChange={(e) => handleHlHex(e.target.value)}
              maxLength={7}
              placeholder="#35B5B5"
              className={hexInput}
            />

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setHlSize((s) => Math.max(1, s - 1))}
                className={btnSmall}
              >
                −
              </button>
              <span className="min-w-[20px] text-center text-xs text-[var(--muted)]">
                {hlSize}
              </span>
              <button
                type="button"
                onClick={() => setHlSize((s) => Math.min(16, s + 1))}
                className={btnSmall}
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={applyHighlight}
              className={btnPrimary}
            >
              Apply
            </button>
            <button
              type="button"
              onClick={removeHighlight}
              className={btnGhost}
            >
              ✕ Highlight
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Static helpers ── */
RichTextEditor.htmlToPlainText = function (html) {
  if (!html || typeof html !== "string") return "";
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
};
RichTextEditor.isEmpty = function (html) {
  return RichTextEditor.htmlToPlainText(html).length === 0;
};
