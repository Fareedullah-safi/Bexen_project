"use client";

import { fixData } from "@/Lib/fixText";
import { ArrowRight, Box } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const SECTION_SIX_STYLES = `
  .rt-inline p { display: inline; margin: 0; }
  .rt-desc p { margin: 0 0 0.5em 0; }
  .rt-desc p:last-child { margin-bottom: 0; }
  .rt-desc strong, .rt-desc b { font-weight: 700; color: inherit; }
  .rt-desc em, .rt-desc i { font-style: italic; }
  .rt-desc a { color: #1E8A8A; text-decoration: underline; text-underline-offset: 2px; }
  .rt-desc ul, .rt-desc ol { margin: 0.4em 0; padding-inline-start: 1.2em; }
  .rt-desc li { margin-bottom: 0.2em; }
`;

export default function SectionSix() {
  const [projectsData, setProjectsData] = useState(null);
  const [language, setLanguage] = useState("en");

  // Fetch projects data from single valid endpoint
  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const res = await fetch("/api/homepage/projects", {
          cache: "no-store",
        });
        const result = await res.json().catch(() => null);

        if (active && result && result.success !== false) {
          const raw = result.data || result;
          setProjectsData(fixData(raw));
        }
      } catch (error) {
        console.error("Failed to load projects section:", error);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  // Listen for language changes from NavBar
  useEffect(() => {
    function handleLanguageChange(event) {
      let nextLanguage = "en";

      try {
        nextLanguage =
          event?.detail?.language ||
          localStorage.getItem("site-language") ||
          "en";
      } catch {
        nextLanguage = "en";
      }

      if (["en", "fa", "ps"].includes(nextLanguage)) {
        setLanguage(nextLanguage);
      }
    }

    handleLanguageChange();

    window.addEventListener("site-language-change", handleLanguageChange);

    return () => {
      window.removeEventListener("site-language-change", handleLanguageChange);
    };
  }, []);

  // Re-trigger WOW.js dynamic animations
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined" && window.WOW) {
        try {
          new window.WOW({ live: false }).sync();
        } catch {}
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [projectsData, language]);

  // Localized text extractor
  const getLocalizedText = (value) => {
    if (typeof value === "string") return value;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value[language] || value.en || value.fa || value.ps || "";
    }

    return "";
  };

  const isRTL = language === "fa" || language === "ps";

  // Header Data Mapping
  const header = projectsData?.header || {};
  const badgeText = getLocalizedText(header.badgeText);
  const headingLine = getLocalizedText(header.headingLine);
  const headingText = getLocalizedText(header.headingText);
  const highlightWord = getLocalizedText(header.highlightWord);
  const description = getLocalizedText(header.description);
  const buttonText = getLocalizedText(header.buttonText);
  const buttonLink =
    typeof header.buttonLink === "string" ? header.buttonLink : "";

  // Projects Mapping
  const projects = (
    Array.isArray(projectsData?.projects) ? projectsData.projects : []
  )
    .map((project) => ({
      ...project,
      image: project.image || project.imageUrl || project.url || "",
      tag: getLocalizedText(project.tag),
      title: getLocalizedText(project.title),
    }))
    .filter((project) => project.image && project.title);

  const handleButtonClick = () => {
    if (buttonLink) {
      window.location.href = buttonLink;
    }
  };

  const renderProject = (project, index) => {
    const patternIndex = index % 4;
    const isLarge = patternIndex === 0 || patternIndex === 3;

    return (
      <div
        key={project._id || project.publicId || index}
        data-wow-duration="0.9s"
        data-wow-delay={index % 2 === 0 ? "0.1s" : "0.25s"}
        className={`wow animate__animated animate__fadeInUp group relative w-full overflow-hidden rounded-2xl ${
          isLarge ? "lg:flex-[1.7]" : "lg:flex-1"
        } h-[280px] sm:h-[340px] md:h-[400px] lg:h-[440px] xl:h-[460px]`}
      >
        {/* Project Image */}
        {project.image && (
          <Image
            src={project.image}
            alt="Project"
            fill
            sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc(100vw - 48px), (max-width: 1400px) 50vw, 650px"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

        {/* Project Tag */}
        {project.tag && (
          <div className="absolute top-4 left-4 z-10 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white backdrop-blur-md transition-all duration-300 hover:bg-[#1E8A8A] sm:px-4 sm:py-2 sm:text-sm">
            <span
              className="rt-inline"
              dangerouslySetInnerHTML={{ __html: project.tag }}
            />
          </div>
        )}

        {/* Project Content */}
        <div className="absolute right-4 bottom-4 left-4 z-10 flex items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div
              role="heading"
              aria-level={3}
              className={`rt-inline line-clamp-2 text-left font-semibold break-words text-white ${
                isLarge
                  ? "text-lg sm:text-xl md:text-2xl"
                  : "text-base sm:text-lg md:text-xl"
              }`}
              dangerouslySetInnerHTML={{ __html: project.title }}
            />
          </div>

          <button
            type="button"
            aria-label="View project"
            className={`group/arrow flex shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 hover:bg-[#167575] ${
              isLarge
                ? "h-11 w-11 sm:h-12 sm:w-12 md:h-14 md:w-14"
                : "h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12"
            } opacity-100 sm:opacity-0 sm:group-hover:opacity-100`}
          >
            <ArrowRight
              size={isLarge ? 24 : 22}
              className={`-rotate-45 transition-transform duration-300 group-hover/arrow:rotate-0 ${
                isRTL ? "rtl:-scale-x-100" : ""
              }`}
            />
          </button>
        </div>
      </div>
    );
  };

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="w-full bg-[#ECF0F0] px-4 py-12 sm:px-6 sm:py-14 lg:px-6 lg:py-16"
    >
      <style dangerouslySetInnerHTML={{ __html: SECTION_SIX_STYLES }} />
      <div className="mx-auto w-full max-w-[1400px]">
        <div className="px-2 sm:px-4 lg:px-8">
          {/* Badge */}
          {badgeText && (
            <span
              data-wow-duration="0.8s"
              className="wow animate__animated animate__fadeInDown group inline-flex items-center gap-2 border border-cyan-100 bg-[#ECF0F0] px-4 py-2"
            >
              <Box
                size={18}
                className="shrink-0 text-[#1E8A8A] transition-transform duration-500 group-hover:rotate-180"
              />

              <span
                className="rt-inline text-sm font-bold text-zinc-950"
                dangerouslySetInnerHTML={{ __html: badgeText }}
              />
            </span>
          )}

          {/* Heading and Description */}
          {(headingLine ||
            headingText ||
            highlightWord ||
            description ||
            buttonText) && (
            <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:gap-10">
              {(headingLine || headingText || highlightWord) && (
                <h1
                  data-wow-duration="0.9s"
                  data-wow-delay="0.1s"
                  className="wow animate__animated animate__fadeInLeft text-3xl leading-tight font-medium text-[#102326] sm:text-4xl md:text-5xl lg:text-[48px]"
                >
                  {headingLine && (
                    <span
                      className="rt-inline"
                      dangerouslySetInnerHTML={{ __html: headingLine }}
                    />
                  )}
                  {headingText && (
                    <span
                      className="rt-inline"
                      dangerouslySetInnerHTML={{ __html: headingText }}
                    />
                  )}
                  {highlightWord && (
                    <span
                      className="rt-inline text-[#1E8A8A]"
                      dangerouslySetInnerHTML={{
                        __html: " " + highlightWord,
                      }}
                    />
                  )}
                </h1>
              )}

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                {description && (
                  <div
                    data-wow-duration="0.9s"
                    data-wow-delay="0.2s"
                    className="wow animate__animated animate__fadeInRight rt-desc max-w-xl flex-1 text-sm leading-6 text-zinc-600 sm:text-base md:text-lg"
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
                )}

                {buttonText && buttonLink && (
                  <button
                    type="button"
                    onClick={handleButtonClick}
                    data-wow-duration="0.8s"
                    data-wow-delay="0.35s"
                    className="wow animate__animated animate__fadeInRight group/button flex h-14 w-full max-w-[220px] shrink-0 cursor-pointer items-center justify-between gap-1 overflow-hidden rounded-full bg-[#1E8A8A] py-1 pr-1 pl-5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#167575] sm:w-48"
                  >
                    <span className="overflow-hidden leading-none">
                      <span
                        className="rt-inline block transition-transform duration-400 [text-shadow:0_30px_0_currentColor] group-hover/button:-translate-y-7.5"
                        dangerouslySetInnerHTML={{ __html: buttonText }}
                      />
                    </span>

                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0C1E21]">
                      <ArrowRight
                        size={18}
                        className={`-rotate-45 transition-transform duration-300 group-hover/button:rotate-0 ${
                          isRTL ? "rtl:-scale-x-100" : ""
                        }`}
                      />
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

          <div
            data-wow-duration="0.8s"
            data-wow-delay="0.4s"
            className="wow animate__animated animate__fadeIn mt-10 h-px w-full bg-[#102326]/10"
          />
        </div>

        {/* Projects */}
        {Array.from(
          { length: Math.ceil(projects.length / 2) },
          (_, rowIndex) => (
            <div
              key={rowIndex}
              className={`${
                rowIndex === 0 ? "mt-10" : "pt-5"
              } w-full px-0 sm:px-4 lg:px-8`}
            >
              <div className="flex w-full flex-col gap-6 lg:flex-row">
                {projects
                  .slice(rowIndex * 2, rowIndex * 2 + 2)
                  .map((project, index) =>
                    renderProject(project, rowIndex * 2 + index),
                  )}
              </div>
            </div>
          ),
        )}
      </div>
    </section>
  );
}
