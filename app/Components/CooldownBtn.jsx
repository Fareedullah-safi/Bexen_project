"use client";

import { useEffect, useState } from "react";

export default function CooldownBtn({
  second = 3,
  type = "button",
  disabled = false,
  className = "",
  children,
}) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (remaining <= 0) return;

    const timer = setTimeout(() => {
      setRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [remaining]);

  return (
    <button
      type={type}
      disabled={disabled || remaining > 0}
      className={className}
      onClick={() => {
        if (remaining === 0 && !disabled) {
          setRemaining(second);
        }
      }}
    >
      {remaining > 0 ? `Wait ${remaining}s...` : children}
    </button>
  );
}
