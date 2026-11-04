// "use client";

// import { Paintbrush, RotateCcw, X } from "lucide-react";
// import { useEffect, useState } from "react";

// const STORAGE_KEY = "admin-ui-styles";

// const DEFAULT_STYLES = {
//   accent: "#1E8A8A",
//   background: "#ffffff",
//   surface: "#f8fafc",
//   foreground: "#0f172a",
//   textMuted: "#64748b",
//   border: "#e2e8f0",
//   radius: "0.75rem",
//   fontSize: "14",
//   fontFamily: "Inter, system-ui, sans-serif",
// };

// const FIELDS = [
//   { key: "accent", label: "Accent Color", type: "color" },
//   { key: "background", label: "Background", type: "color" },
//   { key: "surface", label: "Surface / Cards", type: "color" },
//   { key: "foreground", label: "Text Color", type: "color" },
//   { key: "textMuted", label: "Muted Text", type: "color" },
//   { key: "border", label: "Border Color", type: "color" },
//   {
//     key: "radius",
//     label: "Border Radius",
//     type: "select",
//     options: ["0", "0.25rem", "0.5rem", "0.75rem", "1rem", "1.5rem"],
//   },
//   {
//     key: "fontSize",
//     label: "Base Font Size (px)",
//     type: "number",
//     min: 12,
//     max: 20,
//   },
//   {
//     key: "fontFamily",
//     label: "Font Family",
//     type: "select",
//     options: [
//       "Inter, system-ui, sans-serif",
//       "Poppins, sans-serif",
//       "Roboto, sans-serif",
//       "Open Sans, sans-serif",
//       "DM Sans, sans-serif",
//       "system-ui, sans-serif",
//     ],
//   },
// ];

// function applyStyles(styles) {
//   const root = document.documentElement;
//   root.style.setProperty("--accent", styles.accent);
//   root.style.setProperty("--background", styles.background);
//   root.style.setProperty("--surface", styles.surface);
//   root.style.setProperty("--foreground", styles.foreground);
//   root.style.setProperty("--text-muted", styles.textMuted);
//   root.style.setProperty("--border", styles.border);
//   root.style.setProperty("--radius", styles.radius);
//   root.style.setProperty("--admin-font-size", `${styles.fontSize}px`);
//   root.style.setProperty("--admin-font-family", styles.fontFamily);
// }

// export default function AdminStyleBall() {
//   const [open, setOpen] = useState(false);
//   const [styles, setStyles] = useState(DEFAULT_STYLES);

//   /* Load saved styles on mount */
//   useEffect(() => {
//     try {
//       const saved = localStorage.getItem(STORAGE_KEY);
//       if (saved) {
//         const parsed = { ...DEFAULT_STYLES, ...JSON.parse(saved) };
//         setStyles(parsed);
//         applyStyles(parsed);
//       } else {
//         applyStyles(DEFAULT_STYLES);
//       }
//     } catch {
//       applyStyles(DEFAULT_STYLES);
//     }
//   }, []);

//   /* Update a single value */
//   const update = (key, value) => {
//     const next = { ...styles, [key]: value };
//     setStyles(next);
//     applyStyles(next);
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
//   };

//   /* Reset to defaults */
//   const reset = () => {
//     if (!window.confirm("Reset admin UI to default styles?")) return;
//     setStyles(DEFAULT_STYLES);
//     applyStyles(DEFAULT_STYLES);
//     localStorage.removeItem(STORAGE_KEY);
//   };

//   return (
//     <>
//       {/* FLOATING BALL */}
//       <button
//         type="button"
//         onClick={() => setOpen(!open)}
//         className={`fixed right-6 bottom-6 z-[9999] flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-xl transition-all hover:scale-110 ${
//           open ? "rotate-180 bg-red-500" : ""
//         }`}
//         title="Admin UI Styles"
//         aria-label="Toggle style panel"
//       >
//         {open ? <X size={22} /> : <Paintbrush size={22} />}
//       </button>

//       {/* BACKDROP */}
//       {open && (
//         <div
//           className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm"
//           onClick={() => setOpen(false)}
//         />
//       )}

//       {/* PANEL */}
//       {open && (
//         <div className="fixed right-6 bottom-24 z-[9999] flex max-h-[80vh] w-80 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] shadow-2xl">
//           {/* HEADER */}
//           <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] p-4">
//             <div>
//               <h2 className="text-base font-bold">Admin UI Styles</h2>
//               <p className="mt-0.5 text-xs text-[var(--text-muted)]">
//                 Changes save automatically
//               </p>
//             </div>
//             <button
//               type="button"
//               onClick={reset}
//               className="flex cursor-pointer items-center gap-1 rounded-lg border border-[var(--border)] px-2 py-1 text-xs font-medium transition-colors hover:bg-[var(--surface)]"
//               title="Reset to defaults"
//             >
//               <RotateCcw size={12} /> Reset
//             </button>
//           </div>

//           {/* FIELDS */}
//           <div className="flex-1 overflow-y-auto p-4">
//             <div className="space-y-3">
//               {FIELDS.map((field) => (
//                 <div key={field.key}>
//                   <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
//                     {field.label}
//                   </label>

//                   {field.type === "color" && (
//                     <div className="flex items-center gap-2">
//                       <input
//                         type="color"
//                         value={styles[field.key]}
//                         onChange={(e) => update(field.key, e.target.value)}
//                         className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-[var(--border)] bg-transparent p-0.5"
//                       />
//                       <input
//                         type="text"
//                         value={styles[field.key]}
//                         onChange={(e) => update(field.key, e.target.value)}
//                         className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 font-mono text-xs outline-none focus:border-[var(--accent)]"
//                       />
//                     </div>
//                   )}

//                   {field.type === "select" && (
//                     <select
//                       value={styles[field.key]}
//                       onChange={(e) => update(field.key, e.target.value)}
//                       className="w-full cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs outline-none focus:border-[var(--accent)]"
//                     >
//                       {field.options.map((opt) => (
//                         <option key={opt} value={opt}>
//                           {opt.includes(",") ? opt.split(",")[0].trim() : opt}
//                         </option>
//                       ))}
//                     </select>
//                   )}

//                   {field.type === "number" && (
//                     <input
//                       type="number"
//                       value={styles[field.key]}
//                       min={field.min}
//                       max={field.max}
//                       onChange={(e) => update(field.key, e.target.value)}
//                       onWheel={(e) => e.currentTarget.blur()}
//                       className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs outline-none focus:border-[var(--accent)]"
//                     />
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
