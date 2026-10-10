"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Box } from "lucide-react";
import Image from "next/image";

export default function SectionFive() {
  const [current, setCurrent] = useState(0);
  const [animate, setAnimate] = useState(true);

  const [badge, setBadge] = useState("OUR SOLUTIONS");
  const [headingOne, setHeadingOne] = useState("Solutions to Transform");
  const [headingTwo, setHeadingTwo] = useState("Your");
  const [highlight, setHighlight] = useState("Business.");
  const [solutions, setSolutions] = useState([]);

  useEffect(() => {
    const LoadData = async () => {
      try {
        const res = await fetch("/api/homepage/services");
        const result = await res.json();

        if (result.success && result.data) {
          if (result.data.badge) setBadge(result.data.badge);
          if (result.data.headingOne) setHeadingOne(result.data.headingOne);
          if (result.data.headingTwo) setHeadingTwo(result.data.headingTwo);
          if (result.data.highlight) setHighlight(result.data.highlight);
          if (result.data.solutions?.length > 0) {
            setSolutions(result.data.solutions);
          }
        }
      } catch (error) {
        console.error("Error loading services:", error);
      }
    };

    LoadData();
  }, []);

  const sliderItems =
    solutions.length > 1 ? [...solutions, ...solutions] : solutions;

  const nextSlide = () => {
    setAnimate(true);
    setCurrent((prev) => prev + 1);
  };

  const prevSlide = () => {
    if (current === 0) {
      setAnimate(false);
      setCurrent(solutions.length);

      setTimeout(() => {
        setAnimate(true);
        setCurrent(solutions.length - 1);
      }, 50);
    } else {
      setAnimate(true);
      setCurrent((prev) => prev - 1);
    }
  };

  useEffect(() => {
    if (solutions.length === 0) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 4000);

    return () => clearInterval(interval);
  }, [solutions.length]);

  useEffect(() => {
    if (solutions.length > 0 && current === solutions.length) {
      const timeout = setTimeout(() => {
        setAnimate(false);
        setCurrent(0);

        setTimeout(() => {
          setAnimate(true);
        }, 50);
      }, 700);

      return () => clearTimeout(timeout);
    }
  }, [current, solutions.length]);

  return (
    <main className="w-full px-3 sm:px-4">
      <section className="relative min-h-screen w-full overflow-hidden rounded-2xl bg-slate-950">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98133_1px,transparent_1px),linear-gradient(to_bottom,#10b98133_1px,transparent_1px)] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-size-[14px_24px]" />

        {/* Soft Glow */}
        <div className="absolute top-0 left-1/2 h-100 w-100 -translate-x-1/2 rounded-full bg-[#1E8A8A]/10 blur-3xl" />

        <div className="relative z-10 px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-24">
          {/* Badge */}
          <div className="flex justify-center">
            <span
              className="wow animate__animated animate__fadeInDown group inline-flex items-center gap-2 rounded-full border border-white/20 bg-zinc-900 px-3 py-1.5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-[#1E8A8A]/50 hover:bg-cyan-950 sm:px-4"
              data-wow-duration="0.8s"
            >
              <Box
                size={16}
                className="text-[#1E8A8A] transition-transform duration-500 group-hover:rotate-180"
              />

              <span className="text-xs font-semibold tracking-wide text-zinc-200">
                {badge}
              </span>
            </span>
          </div>

          {/* Heading */}
          <h1
            className="wow animate__animated animate__fadeInUp mx-auto mt-5 max-w-3xl text-center text-3xl leading-tight font-medium text-zinc-200 sm:text-4xl md:text-5xl lg:text-[50px]"
            data-wow-duration="1s"
            data-wow-delay="0.2s"
          >
            {headingOne}
            <br />
            {headingTwo} <span className="text-[#1E8A8A]">{highlight}</span>
          </h1>

          {/* Slider */}
          <div className="mx-auto mt-10 max-w-7xl overflow-hidden sm:mt-14">
            <div
              className={`flex ${animate ? "transition-transform duration-700 ease-in-out" : ""}`}
              style={{
                transform: `translateX(-${
                  current *
                  (typeof window !== "undefined"
                    ? window.innerWidth < 1024
                      ? 100
                      : 100 / 3
                    : 100 / 3)
                }%)`,
              }}
            >
              {sliderItems.map((solution, index) => (
                <div
                  key={`${solution.title}-${index}`}
                  className="w-full shrink-0 px-2 lg:w-1/3"
                >
                  {/* Card */}
                  <div
                    className="wow animate__animated animate__fadeInUp group relative h-105 overflow-hidden rounded-2xl border border-white/10 bg-[#102326] shadow-lg transition-all duration-500 hover:-translate-y-2 hover:border-[#1E8A8A]/40 hover:shadow-2xl hover:shadow-[#1E8A8A]/10"
                    data-wow-duration="0.8s"
                    data-wow-delay={`${0.1 + (index % 3) * 0.15}s`}
                  >
                    {/* Image */}
                    <Image
                      src={solution.image}
                      alt={solution.title}
                      width={400}
                      height={420}
                      className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-all duration-700 group-hover:scale-110 group-hover:opacity-100"
                    />

                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-[#071719] via-[#071719]/70 to-[#071719]/20 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

                    {/* Content */}
                    <div className="absolute right-0 bottom-0 left-0 z-10 p-5 sm:p-6">
                      {/* Number */}
                      <span className="text-sm font-semibold text-[#1E8A8A] transition-colors duration-300 group-hover:text-white">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      {/* Title */}
                      <h2 className="mt-2 max-w-75 text-xl leading-7 font-semibold text-white transition-transform duration-500 group-hover:-translate-y-1 sm:text-2xl">
                        {solution.title}
                      </h2>

                      {/* Hidden Content */}
                      <div className="max-h-0 overflow-hidden opacity-0 transition-all duration-500 group-hover:max-h-48 group-hover:opacity-100">
                        <p className="mt-4 text-sm leading-6 text-zinc-300">
                          {solution.description}
                        </p>

                        <button
                          type="button"
                          className="group/button mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white"
                        >
                          <span className="overflow-hidden leading-none">
                            <span className="block text-lg transition-transform duration-400 ease-in-out [text-shadow:0_30px_0_currentColor] group-hover/button:-translate-y-7.5">
                              Learn More
                            </span>
                          </span>

                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1E8A8A]">
                            <ArrowRight
                              size={16}
                              className="-rotate-45 text-white transition-transform duration-300 group-hover/button:rotate-0"
                            />
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Hover Glow */}
                    <div className="pointer-events-none absolute inset-0 bg-[#1E8A8A]/0 transition-all duration-500 group-hover:bg-[#1E8A8A]/10" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div
            className="wow animate__animated animate__fadeInUp mt-8 flex justify-center gap-3"
            data-wow-duration="0.8s"
            data-wow-delay="0.6s"
          >
            {/* Previous */}
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous solution"
              className="group flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/5 text-white backdrop-blur-sm transition-all duration-300 hover:border-[#1E8A8A] hover:bg-[#1E8A8A] sm:h-12 sm:w-12"
            >
              <ArrowLeft
                size={18}
                className="transition-transform duration-300 group-hover:-translate-x-1"
              />
            </button>

            {/* Next */}
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next solution"
              className="group flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/5 text-white backdrop-blur-sm transition-all duration-300 hover:border-[#1E8A8A] hover:bg-[#1E8A8A] sm:h-12 sm:w-12"
            >
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
