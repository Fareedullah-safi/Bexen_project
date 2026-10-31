"use client";

export default function Spinner({ size = 22, text = "", className = "" }) {
  const stroke = Math.max(2, Math.round(size * 0.1));

  return (
    <div
      className={`flex items-center justify-center gap-2.5 ${className}`}
      role="status"
      aria-label={text || "Loading"}
    >
      <span
        className="relative inline-flex shrink-0 items-center justify-center"
        style={{
          width: size,
          height: size,
        }}
      >
        {/* Outer track */}
        <span
          className="absolute inset-0 rounded-full border border-[var(--border)]"
          aria-hidden="true"
        />

        {/* Animated ring */}
        <span
          className="absolute inset-0 animate-spin rounded-full border-transparent border-t-[var(--accent)] border-r-[var(--accent)]"
          style={{
            borderWidth: stroke,
            animationDuration: "0.7s",
          }}
          aria-hidden="true"
        />

        {/* Center dot */}
        <span
          className="absolute rounded-full bg-[var(--accent)]"
          style={{
            width: Math.max(3, size * 0.16),
            height: Math.max(3, size * 0.16),
          }}
          aria-hidden="true"
        />
      </span>

      {text && (
        <span className="text-sm font-medium text-[var(--muted)]">{text}</span>
      )}
    </div>
  );
}
