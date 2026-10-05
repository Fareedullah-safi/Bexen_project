"use client";

export default function Textarea({
  label,
  name,
  value,
  defaultValue,
  placeholder,
  rows = 5,
  required = false,
  disabled = false,
  error,
  hint,
  className = "",
  onChange,
  onBlur,
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="mb-2 block text-xs font-semibold text-[#0C1E21] dark:text-white"
        >
          {label}

          {required && (
            <span className="ml-1 text-red-500">*</span>
          )}
        </label>
      )}

      <textarea
        id={name}
        name={name}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        className={`w-full resize-y rounded-xl border bg-slate-50 px-3.5 py-3 text-sm text-[#0C1E21] outline-none transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/[0.04] dark:text-white ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
            : "border-black/[0.07] focus:border-[#1E8A8A]/40 focus:bg-white focus:ring-4 focus:ring-[#1E8A8A]/[0.07] dark:border-white/[0.08] dark:focus:bg-white/[0.06]"
        }`}
      />

      {error && (
        <p className="mt-1.5 text-[11px] text-red-500">
          {error}
        </p>
      )}

      {!error && hint && (
        <p className="mt-1.5 text-[11px] text-slate-400">
          {hint}
        </p>
      )}
    </div>
  );
}
