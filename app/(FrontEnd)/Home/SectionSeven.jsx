"use client";

import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function AnimatedNumber({ value }) {
  const [number, setNumber] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        const startTime = performance.now();
        const duration = 2000;

        const animate = (currentTime) => {
          const progress = Math.min((currentTime - startTime) / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 4);
          const currentValue = value * easeOut;

          setNumber(Number(currentValue.toFixed(1)));

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);
        observer.disconnect();
      },
      {
        threshold: 0.3,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{number}</span>;
}

export default function SectionSeven() {
  const stats = [
    {
      number: 93,
      suffix: "%",
      title: "Projects Completed.",
    },
    {
      number: 20,
      suffix: "M",
      title: "Reach Worldwide",
    },
    {
      number: 8.5,
      suffix: "X",
      title: "Faster Growth",
    },
    {
      number: 100,
      suffix: "+",
      title: "Awards Archived",
    },
  ];

  return (
    <section className="w-full relative z-20 -mt-20 px-4 py-16 sm:px-6 md:px-10 lg:px-12 xl:px-16">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-white/15 bg-[#1E8A8A] shadow-2xl sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.title}
              data-wow-duration="0.8s"
              data-wow-delay={`${index * 0.12}s`}
              className="wow animate__animated animate__fadeInUp group relative flex min-h-52 cursor-pointer flex-col justify-between overflow-hidden border-b border-white/15 px-6 py-7 transition-all duration-500 hover:bg-[#0C1E21]/15 sm:px-8 lg:min-h-60 lg:border-r lg:border-b-0 lg:last:border-r-0"
            >
              {/* Soft glow */}
              <div className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-white/10 blur-3xl transition-all duration-500 group-hover:bg-white/20" />

              {/* Top */}
              <div className="relative flex items-start justify-between">
                <span className="text-sm font-semibold tracking-wider text-white/70">
                  0{index + 1}
                </span>

                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 transition-all duration-500 group-hover:rotate-45 group-hover:bg-white/20">
                  <ArrowUpRight
                    size={18}
                    className="text-white transition-transform duration-500"
                  />
                </span>
              </div>

              {/* Bottom */}
              <div className="relative mt-6">
                <div className="flex items-end gap-2">
                  <span className="text-5xl leading-none font-medium tracking-tight text-white sm:text-7xl">
                    <AnimatedNumber value={stat.number} />
                  </span>

                  <span className="pb-1 text-2xl leading-none font-medium text-white/70 sm:text-3xl">
                    {stat.suffix}
                  </span>
                </div>

                <div className="mt-4 h-px w-10 bg-white/30 transition-all duration-500 group-hover:w-16 group-hover:bg-white/60" />

                <p className="mt-3 text-sm font-medium tracking-wide text-white/75 sm:text-base">
                  {stat.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
