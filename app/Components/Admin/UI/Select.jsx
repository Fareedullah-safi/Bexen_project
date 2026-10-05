"use client";

import { ChevronDown } from "lucide-react";

export default function Select({
  label,
  name,
  value,
  defaultValue,
  options = [],
  placeholder = "Select an option",
  required = false,
  disabled = false,
  error,
  hint,
  className = "",
  onChange,
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
        <select
          id={name}
          name={name}
          value={value}
          defaultValue={defaultValue}
          required={required}
          disabled={disabled}
          onChange={onChange}
          className={`h-11 w-full appearance-none rounded-xl border bg-slate-50 px-3.5 pr-10 text-sm text-[#0C1E21] outline-none transition disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/[0.04] dark:text-white ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
              : "border-black/[0.07] focus:border-[#1E8A8A]/40 focus:bg-white focus:ring-4 focus:ring-[#1E8A8A]/[0.07] dark:border-white/[0.08] dark:focus:bg-white/[0.06]"
          }`}
        >
          <option value="">
            {placeholder}
          </option>

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>

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
