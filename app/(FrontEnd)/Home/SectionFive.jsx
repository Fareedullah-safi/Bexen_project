"use client";

import { ArrowLeft, ArrowRight, Box } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function SectionFive() {
  const [current, setCurrent] = useState(0);
  const [animate, setAnimate] = useState(true);

  const [badge, setBadge] = useState("");
  const [headingOne, setHeadingOne] = useState("");
  const [headingTwo, setHeadingTwo] = useState("");
  const [highlight, setHighlight] = useState("");
  const [solutions, setSolutions] = useState([]);
  const [language, setLanguage] = useState("en");

  // Get text for the currently selected language.
  const getLocalizedText = (value, selectedLanguage = language) => {
    if (typeof value === "string") return value;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value[selectedLanguage] || value.en || value.fa || value.ps || "";
    }

    return "";
  };

  // Load services and reload them whenever the language changes
  useEffect(() => {
    let active = true;
    let requestId = 0;

    const loadData = async (selectedLanguage) => {
      const currentRequestId = ++requestId;

      try {
        const res = await fetch(
          `/api/homepage/services?lang=${encodeURIComponent(selectedLanguage)}`,
          { cache: "no-store" },
        );

        const result = await res.json();

        if (
          !active ||
          currentRequestId !== requestId ||
          !res.ok ||
          !result.success ||
          !result.data
        ) {
          if (active && !res.ok) {
            console.error("Failed to load services:", res.status);
          }
          return;
        }

        setBadge(getLocalizedText(result.data.badge, selectedLanguage));
        setHeadingOne(
          getLocalizedText(result.data.headingOne, selectedLanguage),
        );
        setHeadingTwo(
          getLocalizedText(result.data.headingTwo, selectedLanguage),
        );
        setHighlight(getLocalizedText(result.data.highlight, selectedLanguage));

        setSolutions(
          (Array.isArray(result.data.solutions) ? result.data.solutions : [])
            .filter(
              (solution) =>
                solution?.image &&
                getLocalizedText(solution?.title, selectedLanguage),
            )
            .map((solution) => ({
              ...solution,
              title: getLocalizedText(solution.title, selectedLanguage),
              description: getLocalizedText(
                solution.description,
                selectedLanguage,
              ),
            })),
        );

        setCurrent(0);
        setAnimate(true);
      } catch (error) {
        if (active) {
          console.error("Error loading services:", error);
        }
      }
    };

    let initialLanguage = "en";

    try {
      initialLanguage = localStorage.getItem("site-language") || "en";
    } catch {
      // Use English if localStorage is unavailable.
    }

    if (!["en", "fa", "ps"].includes(initialLanguage)) {
      initialLanguage = "en";
    }

    setLanguage(initialLanguage);
    loadData(initialLanguage);

    const handleLanguageChange = (event) => {
      let storedLanguage = "en";

      try {
        storedLanguage = localStorage.getItem("site-language") || "en";
      } catch {
        // Use English if localStorage is unavailable.
      }

      const nextLanguage = event.detail?.language || storedLanguage;

      const validLanguage = ["en", "fa", "ps"].includes(nextLanguage)
        ? nextLanguage
        : "en";

      setLanguage(validLanguage);
      loadData(validLanguage);
    };

    window.addEventListener("site-language-change", handleLanguageChange);

    return () => {
      active = false;
      window.removeEventListener("site-language-change", handleLanguageChange);
    };
  }, []);

  const sliderItems =
    solutions.length > 1 ? [...solutions, ...solutions] : solutions;

  const nextSlide = () => {
    if (solutions.length <= 1) return;

    setAnimate(true);
    setCurrent((prev) => prev + 1);
  };

  const prevSlide = () => {
    if (solutions.length <= 1) return;

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
    if (solutions.length <= 1) return;

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
          {badge && (
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
          )}

          {/* Heading */}
          {(headingOne || headingTwo || highlight) && (
            <h1
              className="wow animate__animated animate__fadeInUp mx-auto mt-5 max-w-3xl text-center text-3xl leading-tight font-medium text-zinc-200 sm:text-4xl md:text-5xl lg:text-[50px]"
              data-wow-duration="1s"
              data-wow-delay="0.2s"
            >
              {headingOne}
              {headingTwo || highlight ? <br /> : null}
              {headingTwo}{" "}
              {highlight && <span className="text-[#1E8A8A]">{highlight}</span>}
            </h1>
          )}

          {/* Slider */}
          {sliderItems.length > 0 && (
            <div className="mx-auto mt-10 max-w-7xl overflow-hidden sm:mt-14">
              <div
                className={`flex ${
                  animate ? "transition-transform duration-700 ease-in-out" : ""
                }`}
                style={{
                  transform: `translateX(-${
                    current *
                    (typeof window !== "undefined" && window.innerWidth < 1024
                      ? 100
                      : 100 / 3)
                  }%)`,
                }}
              >
                {sliderItems.map((solution, index) => (
                  <div
                    key={`${solution._id || solution.title}-${index}`}
                    className="w-full shrink-0 px-2 lg:w-1/3"
                  >
                    {/* Card */}
                    <div
                      className="wow animate__animated animate__fadeInUp group relative h-105 overflow-hidden rounded-2xl border border-white/10 bg-[#102326] shadow-lg transition-all duration-500 hover:-translate-y-2 hover:border-[#1E8A8A]/40 hover:shadow-2xl hover:shadow-[#1E8A8A]/10"
                      data-wow-duration="0.8s"
                      data-wow-delay={`${0.1 + (index % 3) * 0.15}s`}
                    >
                      {/* Image: visible on mobile/tablet, hover reveal on desktop */}
                      <Image
                        src={solution.image}
                        alt={solution.title || "Service"}
                        fill
                        sizes="(max-width: 1023px) calc(100vw - 40px), (max-width: 1280px) 33vw, 400px"
                        className="scale-105 object-cover opacity-100 transition-all duration-700 group-hover:scale-110 lg:opacity-0 lg:group-hover:opacity-100"
                      />

                      {/* Dark Overlay */}
                      <div className="absolute inset-0 bg-linear-to-t from-[#071719] via-[#071719]/70 to-[#071719]/20 opacity-100 transition-opacity duration-700 lg:opacity-0 lg:group-hover:opacity-100" />

                      {/* Content */}
                      <div className="absolute right-0 bottom-0 left-0 z-10 p-5 sm:p-6">
                        {/* Number */}
                        <span className="text-sm font-semibold text-[#1E8A8A] transition-colors duration-300 group-hover:text-white">
                          {String((index % solutions.length) + 1).padStart(
                            2,
                            "0",
                          )}
                        </span>

                        {/* Title */}
                        <h2 className="mt-2 max-w-75 text-xl leading-7 font-semibold text-white transition-transform duration-500 group-hover:-translate-y-1 sm:text-2xl">
                          {solution.title}
                        </h2>

                        {/* Description and Learn More: always visible on mobile/tablet */}
                        <div className="max-h-48 overflow-hidden opacity-100 transition-all duration-500 lg:max-h-0 lg:opacity-0 lg:group-hover:max-h-48 lg:group-hover:opacity-100">
                          {solution.description && (
                            <p className="mt-4 text-sm leading-6 text-zinc-300">
                              {solution.description}
                            </p>
                          )}

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
          )}

          {/* Controls */}
          {solutions.length > 1 && (
            <div
              className="wow animate__animated animate__fadeInUp mt-8 flex justify-center gap-3"
              data-wow-duration="0.8s"
              data-wow-delay="0.6s"
            >
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
          )}
        </div>
      </section>
    </main>
  );
}
