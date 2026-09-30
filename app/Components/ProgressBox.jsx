"use client";
import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";

function Counter({ target }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) animate(count, target, { duration: 2, ease: "easeOut" });
  }, [inView]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

export default function ProgressBox() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <div
      ref={ref}
      className="absolute inset-x-3 bottom-3 z-20 max-w-xs rounded-xl bg-black/25 p-4 shadow-xl backdrop-blur-sm sm:inset-x-auto sm:bottom-5 sm:left-5 sm:w-80 sm:p-5"
    >
      <p className="mb-4 text-lg font-bold tracking-wide text-white sm:mb-4 sm:text-xl">
        Business Progress
      </p>

      {/* Revenue */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-white">Revenue</span>
          <span className="text-sm font-semibold text-white"><Counter target={82} />%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/30">
          <motion.div
            className="h-full rounded-full bg-[#1D8B8A]"
            initial={{ width: "0%" }}
            animate={inView ? { width: "82%" } : {}}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Satisfaction */}
      <div>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-white">Satisfaction</span>
          <span className="text-sm font-semibold text-white"><Counter target={90} />%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/30">
          <motion.div
            className="h-full rounded-full bg-[#1D8B8A]"
            initial={{ width: "0%" }}
            animate={inView ? { width: "90%" } : {}}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}