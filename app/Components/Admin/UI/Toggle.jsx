"use client";

export default function Toggle({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 ${
        disabled
          ? "opacity-50"
          : ""
      }`}
    >
      <div>
        {label && (
          <p className="text-xs font-semibold text-[#0C1E21] dark:text-white">
            {label}
          </p>
        )}

        {description && (
          <p className="mt-1 text-[11px] leading-5 text-slate-400">
            {description}
          </p>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full p-0.5 transition ${
          checked
            ? "bg-[#1E8A8A]"
            : "bg-slate-200 dark:bg-white/[0.12]"
        }`}
      >
        <span
          className={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked
              ? "translate-x-5"
              : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
