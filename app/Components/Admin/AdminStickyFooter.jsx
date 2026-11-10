"use client";

import { LoaderCircle, RotateCcw, Save } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminStickyFooter({
  onReload,
  onSave,
  saving = false,
  busy = false,
  saveLabel = "Save All Changes",
  savingLabel = "Saving...",
  reloadLabel = "Reload Saved Data",
  hideReload = false,
}) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    function update() {
      setIsDark(document.documentElement.classList.contains("dark"));
    }

    update();

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const disabled = busy || saving;

  return (
    <footer
      className={`fixed right-4 bottom-2 left-4 z-50 mx-auto mr-2 ml-5 flex flex-col justify-between gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl sm:right-6 sm:left-64 sm:flex-row sm:items-center sm:px-6 lg:right-8 lg:left-72 ${
        isDark
          ? "border-[#263442] bg-[#111a23]/10 text-white"
          : "border-[#e4e7ec] bg-white/95 text-gray-900"
      }`}
    >
      {!hideReload && (
        <button
          type="button"
          onClick={onReload}
          disabled={disabled}
          className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto ${
            isDark
              ? "border-[#263442] text-gray-300 hover:bg-[#16212c]"
              : "border-[#e4e7ec] text-gray-700 hover:bg-gray-50"
          }`}
        >
          <RotateCcw size={16} />
          {reloadLabel}
        </button>
      )}

      <button
        type="button"
        onClick={onSave}
        disabled={disabled}
        className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1E8A8A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#249b98] disabled:cursor-not-allowed disabled:opacity-60 ${
          hideReload ? "w-full sm:ml-auto sm:w-auto" : "w-full sm:w-auto"
        }`}
      >
        {saving ? (
          <>
            <LoaderCircle size={17} className="animate-spin" />
            {savingLabel}
          </>
        ) : (
          <>
            <Save size={17} />
            {saveLabel}
          </>
        )}
      </button>
    </footer>
  );
}
