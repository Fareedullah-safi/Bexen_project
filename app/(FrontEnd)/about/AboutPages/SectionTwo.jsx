"use client";

import ProgressBox from "@/app/Components/ProgressBox";
import { ArrowRight, Box, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const STYLES = `
  .mv-rt-tight p {
    margin: 0 !important;
    padding: 0 !important;
    display: inline;
  }
  .mv-rt-desc p {
    margin: 0 0 0.5rem 0 !important;
  }
  .mv-rt-desc p:last-child {
    margin-bottom: 0 !important;
  }
  .mv-rt-tight,
  .mv-rt-desc,
  .mv-rt-inline {
    overflow-wrap: break-word !important;
    word-break: normal !important;
  }
`;

const defaultData = {
  image:
    "https://res.cloudinary.com/dbz6ftcwo/image/upload/v1793183536/bexon/about/y7rvbnak6sbxnzg0rbey.jpg",
  buttonLink: "/about",
  progressValue1: 82,
  progressValue2: 90,
  translations: {
    en: {
      topTag: "CHOOSE THE BEST",
      title:
        'Driving Innovation and Excellence for Sustainable Corporate Success <span style="color:#1E8A8A">Worldwide.</span>',
      missionTitle: "Our Mission",
      missionDesc:
        "Our mission is to empower businesses through innovative best solutions, exceptional service.",
      missionList: [
        "Innovation & Excellence",
        "Exceptional Customer",
        "Business Growth",
      ],
      visionTitle: "Our Vision",
      visionDesc:
        "Our vision is to become a global leader in providing transformative business solutions.",
      visionList: [
        "Global Leadership",
        "Transformative Impact",
        "Sustainable Success",
      ],
      progressTitle: "Business Progress",
      progressLabel1: "Revenue",
      progressLabel2: "Satisfaction",
      buttonText: "Learn More About Us",
    },
  },
};

function stripHtml(value) {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getSiteLanguage() {
  if (typeof window === "undefined") return "en";
  try {
    const value = (localStorage.getItem("site-language") || "en")
      .toLowerCase()
      .trim();
    if (value === "ps" || value === "fa" || value === "en") return value;
  } catch (_) {}
  return "en";
}

function resolveTitle(content) {
  if (!content) return "";

  if (content.title && stripHtml(content.title)) {
    return content.title;
  }

  const mainTitle = content.mainTitle || "";
  const highlightedTitle = content.highlightedTitle || "";

  if (mainTitle && highlightedTitle) {
    return (
      mainTitle + ' <span style="color:#1E8A8A">' + highlightedTitle + "</span>"
    );
  }

  return mainTitle || highlightedTitle || "";
}

export default function SectionTwo() {
  const [data, setData] = useState(defaultData);
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const syncLang = () => {
      const next = getSiteLanguage();
      setLang((prev) => (prev !== next ? next : prev));
    };

    syncLang();

    const intervalId = setInterval(syncLang, 300);

    const onStorage = (e) => {
      if (e.key === "site-language") syncLang();
    };

    const onLangChange = () => syncLang();

    window.addEventListener("storage", onStorage);
    window.addEventListener("languageChange", onLangChange);
    window.addEventListener("site-language-change", onLangChange);
    document.addEventListener("visibilitychange", syncLang);
    window.addEventListener("focus", syncLang);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("languageChange", onLangChange);
      window.removeEventListener("site-language-change", onLangChange);
      document.removeEventListener("visibilitychange", syncLang);
      window.removeEventListener("focus", syncLang);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/aboutpage/mission-vision");
        const json = await res.json();
        if (json?.success && json?.data) {
          setData(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch Section Two data:", error);
      }
    };
    fetchData();
  }, []);

  const content =
    data?.translations?.[lang] ||
    data?.translations?.en ||
    defaultData.translations.en;

  const isRTL = lang === "ps" || lang === "fa";
  const titleHtml = resolveTitle(content);

  return (
    <section
      className="relative w-full px-3 py-3 sm:px-4 sm:py-4"
      dir={isRTL ? "rtl" : "ltr"}
      lang={lang}
    >
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div className="relative overflow-hidden rounded-2xl bg-[#dce8e8] sm:rounded-3xl">
        <div
          className="pointer-events-none absolute top-0 left-0 z-0 h-[55%] w-[55%] opacity-[0.09]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, #0C1E21 0, #0C1E21 1px, transparent 1px, transparent 12px)",
            clipPath: "polygon(0 0, 100% 0, 42% 100%, 0 72%)",
            WebkitClipPath: "polygon(0 0, 100% 0, 42% 100%, 0 72%)",
          }}
        />

        <div
          className="pointer-events-none absolute right-0 bottom-0 z-0 h-[55%] w-[55%] opacity-[0.09]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, #0C1E21 0, #0C1E21 1px, transparent 1px, transparent 12px)",
            clipPath: "polygon(100% 100%, 0 100%, 58% 0, 100% 28%)",
            WebkitClipPath: "polygon(100% 100%, 0 100%, 58% 0, 100% 28%)",
          }}
        />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:gap-10 sm:px-8 sm:py-16 md:px-12 lg:flex-row lg:items-stretch lg:gap-10 lg:py-24">
          <div
            data-wow-duration="1s"
            data-wow-delay="0.1s"
            data-wow-offset="100"
            className="wow animate__animated animate__fadeInLeft relative w-full shrink-0 lg:w-1/2"
          >
            <Image
              alt="Team at work"
              width={999}
              height={999}
              sizes="(max-width: 1024px) 100vw, 50vw"
              src={data.image || defaultData.image}
              className="h-[280px] w-full rounded-2xl object-cover sm:h-[400px] md:h-[480px] lg:h-full lg:min-h-[500px]"
            />

            <div
              data-wow-duration="0.9s"
              data-wow-delay="0.35s"
              data-wow-offset="80"
              className="wow animate__animated animate__fadeInUp"
            >
              <ProgressBox
                title={stripHtml(content.progressTitle)}
                label1={stripHtml(content.progressLabel1)}
                value1={data.progressValue1}
                label2={stripHtml(content.progressLabel2)}
                value2={data.progressValue2}
              />
            </div>
          </div>

          <div className="flex w-full min-w-0 flex-col gap-5 sm:gap-6 lg:w-1/2">
            <div
              data-wow-duration="0.8s"
              data-wow-delay="0.1s"
              data-wow-offset="100"
              className="wow animate__animated animate__fadeInDown"
            >
              <span className="group inline-flex w-fit items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50/30 px-3 py-1.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:bg-cyan-100 hover:shadow-md sm:px-4">
                <Box
                  size={18}
                  className="shrink-0 text-[#1E8A8A] transition-transform duration-300 group-hover:rotate-180"
                />
                <span
                  className="mv-rt-tight text-xs font-bold tracking-wide text-zinc-950 uppercase sm:text-sm md:text-base"
                  dangerouslySetInnerHTML={{ __html: content.topTag || "" }}
                />
              </span>
            </div>

            <div
              data-wow-duration="0.9s"
              data-wow-delay="0.2s"
              data-wow-offset="100"
              role="heading"
              aria-level={2}
              className="wow animate__animated animate__fadeInRight mv-rt-tight text-2xl leading-tight font-medium text-[#102326] sm:text-3xl md:text-4xl xl:text-5xl"
              dangerouslySetInnerHTML={{ __html: titleHtml }}
            />

            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
              <div
                data-wow-duration="0.8s"
                data-wow-delay="0.3s"
                data-wow-offset="100"
                className="wow animate__animated animate__fadeInUp flex flex-col gap-4 rounded-2xl bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:p-6"
              >
                <div
                  role="heading"
                  aria-level={3}
                  className="mv-rt-tight text-lg font-bold text-[#0C1E21] sm:text-xl"
                  dangerouslySetInnerHTML={{
                    __html: content.missionTitle || "",
                  }}
                />
                <div
                  className="mv-rt-desc text-sm leading-relaxed text-[#0C1E21]/70 sm:text-[15px]"
                  dangerouslySetInnerHTML={{
                    __html: content.missionDesc || "",
                  }}
                />
                <ul className="flex flex-col gap-2">
                  {(content.missionList || []).map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-[#0C1E21]/80 sm:text-[15px]"
                    >
                      <CheckCircle
                        size={17}
                        className="shrink-0 text-[#1D8B8A]"
                      />
                      <span
                        className="mv-rt-inline mv-rt-tight"
                        dangerouslySetInnerHTML={{ __html: item || "" }}
                      />
                    </li>
                  ))}
                </ul>
              </div>

              <div
                data-wow-duration="0.8s"
                data-wow-delay="0.42s"
                data-wow-offset="100"
                className="wow animate__animated animate__fadeInUp flex flex-col gap-4 rounded-2xl bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:p-6"
              >
                <div
                  role="heading"
                  aria-level={3}
                  className="mv-rt-tight text-lg font-bold text-[#0C1E21] sm:text-xl"
                  dangerouslySetInnerHTML={{
                    __html: content.visionTitle || "",
                  }}
                />
                <div
                  className="mv-rt-desc text-sm leading-relaxed text-[#0C1E21]/70 sm:text-[15px]"
                  dangerouslySetInnerHTML={{
                    __html: content.visionDesc || "",
                  }}
                />
                <ul className="flex flex-col gap-2">
                  {(content.visionList || []).map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-[#0C1E21]/80 sm:text-[15px]"
                    >
                      <CheckCircle
                        size={17}
                        className="shrink-0 text-[#1D8B8A]"
                      />
                      <span
                        className="mv-rt-inline mv-rt-tight"
                        dangerouslySetInnerHTML={{ __html: item || "" }}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div
              data-wow-duration="0.9s"
              data-wow-delay="0.52s"
              data-wow-offset="80"
              className="wow animate__animated animate__fadeInUp w-full"
            >
              <Link href={data.buttonLink || "/about"}>
                <button
                  type="button"
                  className={`group/button flex h-12 w-full cursor-pointer items-center justify-between overflow-hidden rounded-full bg-[#1D8B8A] px-1.5 py-1.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#167575] hover:shadow-xl hover:shadow-[#1D8B8A]/30 sm:h-14 sm:text-base ${
                    isRTL ? "pr-5 sm:pr-6" : "pl-5 sm:pl-6"
                  }`}
                >
                  <span className="overflow-hidden leading-none">
                    <span
                      className="mv-rt-tight block transition-transform duration-300 [text-shadow:0_30px_0_currentColor] group-hover/button:-translate-y-[30px]"
                      dangerouslySetInnerHTML={{
                        __html: content.buttonText || "",
                      }}
                    />
                  </span>

                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0C1E21] sm:h-11 sm:w-11">
                    <ArrowRight
                      size={18}
                      className={`${
                        isRTL
                          ? "rotate-135 group-hover/button:rotate-180"
                          : "-rotate-45 group-hover/button:rotate-0"
                      } text-white transition-transform duration-300`}
                    />
                  </span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
