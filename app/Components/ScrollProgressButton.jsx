"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollProgressButton() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      setScrollProgress(progress);
      setIsVisible(scrollTop > 200);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (scrollProgress / 100) * circumference;
  const roundedProgress = Math.round(scrollProgress);

  return (
    <div
      className={`fixed right-6 bottom-6 z-50 transition-all duration-700 ease-out ${
        isVisible
          ? "translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-8 scale-75 opacity-0"
      }`}
    >
      {/* Outer breathing glow */}
      <div className="animate-ping-slow absolute inset-0 rounded-full bg-[#1D8B8A]/20" />
      <div className="animate-pulse-slow absolute inset-0 rounded-full bg-[#1D8B8A]/10 blur-md" />

      <button
        onClick={scrollToTop}
        aria-label={`Scroll to top, ${roundedProgress}% scrolled`}
        className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-[#1D8B8A]/30"
      >
        {/* Rotating gradient ring background */}
        <svg
          className="animate-spin-slow absolute inset-0 h-full w-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          viewBox="0 0 64 64"
        >
          <defs>
            <linearGradient
              id="rotGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#1D8B8A" stopOpacity="0" />
              <stop offset="100%" stopColor="#1D8B8A" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <circle
            cx="32"
            cy="32"
            r="30"
            fill="none"
            stroke="url(#rotGradient)"
            strokeWidth="2"
          />
        </svg>

        {/* Progress Ring */}
        <svg
          className="absolute inset-0 h-full w-full -rotate-90"
          viewBox="0 0 64 64"
        >
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="3"
            className="transition-all duration-500"
          />
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="#1D8B8A"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500 ease-out"
            style={{
              filter: "drop-shadow(0 0 3px rgba(29, 139, 138, 0.5))",
            }}
          />
        </svg>

        {/* Center content with smooth crossfade */}
        <div className="relative z-10 flex h-8 w-8 items-center justify-center">
          <span
            className={`absolute text-xs font-bold text-[#0C1E21] transition-all duration-500 ease-out group-hover:-translate-y-4 group-hover:opacity-0`}
          >
            {roundedProgress}%
          </span>
          <ArrowUp
            size={18}
            className="absolute translate-y-4 text-[#1D8B8A] opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100"
          />
        </div>

        {/* Subtle floating animation on the whole button */}
        <div className="absolute inset-0 rounded-full transition-transform duration-1000 ease-in-out group-hover:scale-110" />
      </button>
    </div>
  );
}
