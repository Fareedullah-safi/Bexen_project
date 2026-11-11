import { memo, useEffect, useState } from "react";

const CSS = `
.ldr-fade  { animation: ldr-fade .25s ease-out both; }

/* ---------- stage ---------- */
.ldr-stage { position: relative; width: 120px; height: 100px; }

.ldr-shape {
  position: absolute;
  left: 38px;
  top: 28px;
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #5FD4C4, #1E8A8A, #3FB6D8, #7C8CF8, #5FD4C4);
  background-size: 400% 400%;
  box-shadow: 0 6px 18px rgba(30, 138, 138, 0.35);
  animation:
    ldr-hop 1.6s cubic-bezier(.45, 0, .55, 1) infinite,
    ldr-shine 5s linear infinite;
  will-change: transform, border-radius;
}

.ldr-shadow {
  position: absolute;
  left: 36px;
  bottom: 6px;
  width: 48px;
  height: 10px;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(15, 60, 60, .35) 0%, rgba(15, 60, 60, 0) 70%);
  animation: ldr-shadow 1.6s cubic-bezier(.45, 0, .55, 1) infinite;
}

/* ---------- sparkles that pop on each landing ---------- */
.ldr-spark {
  position: absolute;
  left: 57px;
  bottom: 12px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #5FD4C4;
  opacity: 0;
  animation: ldr-spark 1.6s ease-out infinite;
}
.ldr-spark:nth-child(1) { --x: -38px; --y: -26px; background: #5FD4C4; }
.ldr-spark:nth-child(2) { --x: -22px; --y: -40px; background: #3FB6D8; width: 4px; height: 4px; }
.ldr-spark:nth-child(3) { --x:  22px; --y: -40px; background: #7C8CF8; width: 4px; height: 4px; }
.ldr-spark:nth-child(4) { --x:  38px; --y: -26px; background: #1E8A8A; }

/* ---------- progress bar ---------- */
.ldr-bar {
  position: relative;
  width: 200px;
  height: 6px;
  border-radius: 999px;
  background: rgba(30, 138, 138, 0.14);
  overflow: hidden;
}
.ldr-bar-fill {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: linear-gradient(90deg, #5FD4C4, #1E8A8A, #3FB6D8);
  transform-origin: left center;
  transition: transform .5s cubic-bezier(.2, .8, .2, 1);
  overflow: hidden;
}
.ldr-bar-fill::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.6), transparent);
  transform: translateX(-100%);
  animation: ldr-sheen 1.4s ease-in-out infinite;
}

/* ---------- keyframes ---------- */
@keyframes ldr-fade { from { opacity: 0; } to { opacity: 1; } }

@keyframes ldr-hop {
  0%   { border-radius: 50%; transform: translateY(0)     rotate(0deg)   scale(1, 1); }
  25%  { border-radius: 32%; transform: translateY(-18px) rotate(90deg)  scale(.94, .94); }
  50%  { border-radius: 12%; transform: translateY(0)     rotate(180deg) scale(1.08, .9); }
  75%  { border-radius: 32%; transform: translateY(-18px) rotate(270deg) scale(.94, .94); }
  100% { border-radius: 50%; transform: translateY(0)     rotate(360deg) scale(1, 1); }
}
@keyframes ldr-shine {
  0%   { background-position: 0% 50%; }
  100% { background-position: 400% 50%; }
}
@keyframes ldr-shadow {
  0%, 50%, 100% { transform: scale(1);   opacity: 1; }
  25%, 75%      { transform: scale(.55); opacity: .45; }
}
@keyframes ldr-spark {
  0%, 44%  { opacity: 0; transform: translate(0, 0) scale(.4); }
  50%      { opacity: 1; transform: translate(0, 0) scale(1); }
  72%      { opacity: 0; transform: translate(var(--x), var(--y)) scale(.2); }
  100%     { opacity: 0; transform: translate(var(--x), var(--y)) scale(.2); }
}
@keyframes ldr-sheen { to { transform: translateX(100%); } }

/* Reduced motion: calmer, never frozen */
@media (prefers-reduced-motion: reduce) {
  .ldr-shape, .ldr-shadow { animation-duration: 3.2s, 10s; }
  .ldr-spark { animation: none; opacity: 0; }
  .ldr-bar-fill::after { animation: none; }
}
`;

/**
 * Loader (no text)
 *
 * Props:
 * - progress    Real progress 0-100. If omitted, a simulated bar eases toward 95%.
 * - showBar     Show the progress bar (default true)
 * - label       Screen-reader text (not visible)
 * - fullScreen  Fixed overlay (true) or fill a relative parent (false)
 * - delay       ms before showing visuals, avoids a flash on fast loads
 * - className   Extra classes for the root
 */
function Loader({
  progress,
  showBar = true,
  label = "Loading",
  fullScreen = true,
  delay = 100,
  className = "",
}) {
  const [visible, setVisible] = useState(delay <= 0);
  const [simulated, setSimulated] = useState(6);

  const isControlled = typeof progress === "number";

  useEffect(() => {
    if (delay <= 0) return undefined;
    const id = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(id);
  }, [delay]);

  // simulated progress: always moving, never reaches 100%
  useEffect(() => {
    if (!visible || isControlled || !showBar) return undefined;
    const id = setInterval(() => {
      setSimulated((p) => p + (95 - p) * 0.035);
    }, 300);
    return () => clearInterval(id);
  }, [visible, isControlled, showBar]);

  const value = Math.max(0, Math.min(100, isControlled ? progress : simulated));
  const position = fullScreen ? "fixed inset-0 z-[9999]" : "absolute inset-0";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`${position} flex items-center justify-center bg-[#F7F9FC] ${className}`}
    >
      <style>{CSS}</style>
      <span className="sr-only">{label}</span>

      {visible && (
        <div
          className="ldr-fade flex flex-col items-center gap-4"
          aria-hidden="true"
        >
          <div className="ldr-stage">
            <div className="ldr-shadow" />
            <span className="ldr-spark" />
            <span className="ldr-spark" />
            <span className="ldr-spark" />
            <span className="ldr-spark" />
            <div className="ldr-shape" />
          </div>

          {showBar && (
            <div className="ldr-bar">
              <div
                className="ldr-bar-fill"
                style={{ transform: `scaleX(${value / 100})` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(Loader);
