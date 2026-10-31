"use client";

import { Check, Globe2, Languages, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English", direction: "ltr" },
  { code: "ps", label: "Pashto", nativeLabel: "پښتو", direction: "rtl" },
  { code: "fa", label: "Dari", nativeLabel: "دری", direction: "rtl" },
];

export default function AdminLanguageBall({
  language = "en",
  onLanguageChange,
  scrollThreshold = 200,
}) {
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [orbHovered, setOrbHovered] = useState(false);

  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  const activeLanguage =
    LANGUAGES.find((item) => item.code === language) || LANGUAGES[0];

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > scrollThreshold);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollThreshold]);

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const selectLanguage = (code) => {
    if (code !== language) onLanguageChange?.(code);
    setMenuOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`fixed top-20 right-6 z-[1000] ${
        visible
          ? "pointer-events-auto visible translate-y-0 scale-100 opacity-100"
          : "pointer-events-none invisible -translate-y-4 scale-90 opacity-0"
      } transition-[opacity,transform,visibility] duration-500 ease-out motion-reduce:transition-none`}
    >
      {/* Floating glass orb */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setMenuOpen((current) => !current)}
        onMouseEnter={() => setOrbHovered(true)}
        onMouseLeave={() => setOrbHovered(false)}
        aria-label={`Content language: ${activeLanguage.label}`}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        title={`Content language: ${activeLanguage.label}`}
        className={`group relative isolate grid h-[60px] w-[60px] place-items-center rounded-full border border-white/60 text-gray-800 shadow-[0_8px_28px_rgba(16,24,40,0.12),inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-2xl backdrop-saturate-150 transition-[transform,box-shadow,border-color] duration-300 ease-out hover:scale-110 hover:border-teal-600/40 hover:shadow-[0_12px_34px_rgba(16,24,40,0.16),0_0_0_4px_rgba(30,138,138,0.08)] focus-visible:ring-4 focus-visible:ring-teal-600/30 focus-visible:outline-none motion-safe:animate-[orbFloat_5s_ease-in-out_infinite] ${
          menuOpen
            ? "scale-105 border-teal-600/40 shadow-[0_12px_34px_rgba(16,24,40,0.16),0_0_0_4px_rgba(30,138,138,0.08)]"
            : ""
        }`}
        style={{
          background:
            "radial-gradient(circle at 28% 20%, rgba(255,255,255,.96), rgba(255,255,255,.43) 30%, transparent 54%), radial-gradient(circle at 72% 78%, rgba(30,138,138,.22), transparent 52%), rgba(255,255,255,.38)",
        }}
      >
        {/* Inner glass ring */}
        <span className="pointer-events-none absolute inset-[5px] rounded-full border border-white/60" />

        {/* Teal ambient glow */}
        <span className="pointer-events-none absolute -inset-1 -z-10 rounded-full bg-teal-600/15 blur-xl transition duration-300 group-hover:scale-125 group-hover:bg-teal-500/25" />

        <span
          className={`relative grid place-items-center text-teal-700 transition-transform duration-500 ${
            orbHovered || menuOpen ? "scale-110 rotate-[18deg]" : ""
          }`}
        >
          {orbHovered || menuOpen ? (
            <Languages size={25} strokeWidth={1.65} />
          ) : (
            <Globe2 size={27} strokeWidth={1.55} />
          )}
        </span>

        {/* Language badge */}
        <span className="absolute -right-1 -bottom-1 grid h-[23px] min-w-[23px] place-items-center rounded-full border-2 border-white bg-gradient-to-br from-teal-500 to-teal-800 px-1 text-[9px] font-extrabold tracking-wide text-white uppercase shadow-md">
          {activeLanguage.code}
        </span>
      </button>

      {/* Animated glass language menu */}
      {menuOpen && (
        <div
          role="menu"
          aria-label="Choose content language"
          className="absolute top-[72px] right-0 w-[278px] origin-top-right animate-[panelIn_250ms_ease-out_both] rounded-[22px] border border-white/50 bg-white/85 p-2.5 text-gray-900 shadow-[0_22px_65px_rgba(16,24,40,0.15)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-slate-900/85 dark:text-gray-100"
        >
          {/* Menu header */}
          <div className="mb-2 flex items-center gap-3 border-b border-gray-200/80 px-2.5 pt-2.5 pb-3.5 dark:border-white/10">
            <div className="grid h-[39px] w-[39px] shrink-0 place-items-center rounded-[13px] bg-teal-600/10 text-teal-700 dark:text-teal-300">
              <Languages size={21} strokeWidth={1.8} />
            </div>

            <div>
              <p className="text-sm font-bold tracking-tight">
                Content language
              </p>
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                Choose the language to edit
              </p>
            </div>
          </div>

          {/* Language options */}
          <div className="grid gap-1">
            {LANGUAGES.map((item) => {
              const isActive = item.code === language;

              return (
                <button
                  key={item.code}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isActive}
                  onClick={() => selectLanguage(item.code)}
                  className={`flex w-full items-center gap-3 rounded-[14px] border p-2.5 text-left transition duration-200 hover:translate-x-0.5 hover:bg-teal-600/[0.07] focus-visible:ring-2 focus-visible:ring-teal-600/40 focus-visible:outline-none ${
                    isActive
                      ? "border-teal-600/15 bg-teal-600/10"
                      : "border-transparent"
                  }`}
                >
                  <span
                    className={`grid h-[42px] w-[42px] shrink-0 place-items-center rounded-[13px] border text-[13px] font-extrabold transition-colors ${
                      isActive
                        ? "border-teal-600/20 bg-teal-600/10 text-teal-700 dark:text-teal-300"
                        : "border-gray-200 bg-gray-50 text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
                    }`}
                  >
                    {item.code.toUpperCase()}
                  </span>

                  <span className="grid min-w-0 flex-1 gap-1">
                    <span className="text-[13px] leading-5 font-bold">
                      {item.label}
                    </span>
                    <span
                      dir={item.direction}
                      className="text-xs leading-5 text-gray-500 dark:text-gray-400"
                    >
                      {item.nativeLabel}
                    </span>
                  </span>

                  {isActive && (
                    <span className="grid h-6 w-6 shrink-0 animate-[checkIn_200ms_ease-out_both] place-items-center rounded-full bg-teal-700 text-white">
                      <Check size={14} strokeWidth={2.5} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Menu footer */}
          <div className="mt-2 flex items-center gap-2 border-t border-gray-200/80 px-2.5 pt-3 pb-1 text-[11px] text-gray-500 dark:border-white/10 dark:text-gray-400">
            <Sparkles size={13} className="text-teal-600" />
            <span>Active language: {activeLanguage.label}</span>
          </div>
        </div>
      )}

      {/* Keyframes using Tailwind arbitrary animation names */}
      <style jsx>{`
        @keyframes orbFloat {
          0%,
          100% {
            translate: 0 0;
          }
          50% {
            translate: 0 -3px;
          }
        }

        @keyframes panelIn {
          from {
            opacity: 0;
            transform: translateY(-9px) scale(0.94);
            filter: blur(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes checkIn {
          from {
            opacity: 0;
            transform: scale(0.65);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
