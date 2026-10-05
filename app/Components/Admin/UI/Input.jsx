"use client";

import { AlertCircle } from "lucide-react";

export default function Input({
  label,
  name,
  type = "text",
  value,
  defaultValue,
  placeholder,
  required = false,
  disabled = false,
  error,
  hint,
  icon,
  className = "",
  inputClassName = "",
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

      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          onChange={onChange}
          onBlur={onBlur}
          aria-invalid={Boolean(error)}
          className={`h-11 w-full rounded-xl border bg-slate-50 px-3.5 text-sm text-[#0C1E21] outline-none transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/[0.04] dark:text-white ${
            icon ? "pl-10" : ""
          } ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
              : "border-black/[0.07] focus:border-[#1E8A8A]/40 focus:bg-white focus:ring-4 focus:ring-[#1E8A8A]/[0.07] dark:border-white/[0.08] dark:focus:bg-white/[0.06]"
          } ${inputClassName}`}
        />
      </div>

      {error ? (
        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-500">
          <AlertCircle size={12} />
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[11px] text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
