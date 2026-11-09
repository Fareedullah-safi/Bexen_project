"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const SERVICE_DETAILS_STYLES = `
  .rt-inline p { display: inline; margin: 0; }
  .rt-desc p { margin: 0 0 0.5em 0; }
  .rt-desc p:last-child { margin-bottom: 0; }
  .rt-desc strong, .rt-desc b { font-weight: 700; color: inherit; }
  .rt-desc em, .rt-desc i { font-style: italic; }
  .rt-desc a { color: #1E8A8A; text-decoration: underline; text-underline-offset: 2px; }
  .rt-desc ul, .rt-desc ol { margin: 0.4em 0; padding-inline-start: 1.2em; }
  .rt-desc li { margin-bottom: 0.2em; }
`;

/* Helper to strip HTML tags for empty checks */
function stripHtml(val) {
  return String(val || "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

export default function ServiceDetailsFrontendView({
  data,
  lang: langProp = "en",
}) {
  const [lang, setLang] = useState(langProp);

  /* Sync with incoming langProp */
  useEffect(() => {
    if (langProp) {
      setLang(langProp);
    }
  }, [langProp]);

  /* Listen for language changes from NavBar */
  useEffect(() => {
    function handleLanguageChange(event) {
      let selectedLanguage = "en";
      if (event && event.detail && event.detail.language) {
        selectedLanguage = event.detail.language;
      } else {
        selectedLanguage = localStorage.getItem("site-language") || "en";
      }

      if (
        selectedLanguage === "en" ||
        selectedLanguage === "ps" ||
        selectedLanguage === "fa"
      ) {
        setLang(selectedLanguage);
      }
    }

    window.addEventListener("site-language-change", handleLanguageChange);
    return function () {
      window.removeEventListener("site-language-change", handleLanguageChange);
    };
  }, []);

  /* Re-trigger WOW.js after dynamic mount */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined" && window.WOW) {
        try {
          new window.WOW({ live: false }).sync();
        } catch {}
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  /* ── helpers ── */
  const content = data?.[lang] || data?.en || {};
  const isRTL = lang === "ps" || lang === "fa";
  const heroImageUrl = data?.heroImage?.url || "";
  const services = data?.services || [];

  const mainTitleText = stripHtml(content.mainTitle);
  const desc1Text = stripHtml(content.description1);
  const desc2Text = stripHtml(content.description2);
  const desc3Text = stripHtml(content.description3);
  const sidebarTagText = stripHtml(content.sidebarTag);
  const sidebarTitleText = stripHtml(content.sidebarTitle);

  return (
    <section
      className="w-full bg-white px-4 py-14 sm:px-6 sm:py-16 md:px-8 lg:px-10 lg:py-24 xl:px-16"
      dir={isRTL ? "rtl" : "ltr"}
      lang={lang}
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-14 xl:grid-cols-[minmax(0,1fr)_350px] xl:gap-20">
        {/* Left content column */}
        <main className="w-full min-w-0">
          {heroImageUrl && (
            <div
              className="wow animate__animated animate__fadeInUp relative overflow-hidden rounded-2xl sm:rounded-3xl"
              data-wow-duration="1s"
              data-wow-delay="0.1s"
            >
              <Image
                src={heroImageUrl}
                alt="Service"
                width={1000}
                height={700}
                priority
                unoptimized
                sizes="(max-width: 1024px) 100vw, 70vw"
                className="xs:h-[200px] h-[180px] w-full object-cover transition-transform duration-700 hover:scale-[1.03] sm:h-[280px] md:h-[360px] lg:h-[420px]"
              />
            </div>
          )}

          <div className="mt-7 sm:mt-10">
            {mainTitleText && (
              <div
                role="heading"
                aria-level={1}
                className="wow animate__animated animate__fadeInUp rt-inline xs:text-3xl text-[26px] leading-[1.18] font-medium tracking-tight text-[#102326] sm:text-4xl md:text-5xl"
                data-wow-duration="0.9s"
                data-wow-delay="0.15s"
                dangerouslySetInnerHTML={{ __html: content.mainTitle }}
              />
            )}

            {desc1Text && (
              <div
                className="wow animate__animated animate__fadeInUp mt-5 sm:mt-6"
                data-wow-duration="0.8s"
                data-wow-delay="0.25s"
              >
                <div
                  className="rt-desc text-sm leading-7 text-[#102326]/65 sm:text-base sm:leading-8"
                  dangerouslySetInnerHTML={{ __html: content.description1 }}
                />
              </div>
            )}

            {desc2Text && (
              <div
                className="wow animate__animated animate__fadeInUp mt-4"
                data-wow-duration="0.8s"
                data-wow-delay="0.35s"
              >
                <div
                  className="rt-desc text-sm leading-7 text-[#102326]/65 sm:text-base sm:leading-8"
                  dangerouslySetInnerHTML={{ __html: content.description2 }}
                />
              </div>
            )}

            {desc3Text && (
              <div
                className="wow animate__animated animate__fadeInUp mt-4"
                data-wow-duration="0.8s"
                data-wow-delay="0.45s"
              >
                <div
                  className="rt-desc text-sm leading-7 text-[#102326]/65 sm:text-base sm:leading-8"
                  dangerouslySetInnerHTML={{ __html: content.description3 }}
                />
              </div>
            )}
          </div>
        </main>

        {/* Right sidebar */}
        <aside
          style={{ contain: "layout" }}
          className="min-w-0 will-change-transform lg:sticky lg:top-28 lg:self-start"
        >
          <div
            className="wow animate__animated animate__fadeInRight rounded-2xl bg-[#ECF0F0] p-5 sm:rounded-3xl sm:p-6"
            data-wow-duration="0.9s"
            data-wow-delay="0.15s"
          >
            <div className="mb-5">
              {sidebarTagText && (
                <div
                  className="rt-inline text-xs font-bold tracking-[0.18em] text-[#1E8A8A] uppercase"
                  dangerouslySetInnerHTML={{ __html: content.sidebarTag }}
                />
              )}
              {sidebarTitleText && (
                <div
                  role="heading"
                  aria-level={3}
                  className="rt-desc mt-2 text-xl font-medium text-[#0C1E21] sm:text-2xl"
                  dangerouslySetInnerHTML={{ __html: content.sidebarTitle }}
                />
              )}
            </div>

            <div className="flex flex-col gap-2">
              {services.map((service, index) => {
                let label =
                  service.translations?.[lang]?.label ||
                  service.translations?.en?.label ||
                  service.label?.[lang] ||
                  service.label ||
                  "";

                if (typeof label !== "string") {
                  label = "";
                }

                return (
                  <Link
                    key={service.id || index}
                    href={service.href || "#"}
                    className={`wow animate__animated animate__fadeInUp group flex min-h-14 items-center justify-between gap-3 rounded-xl px-4 py-3.5 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#1E8A8A] focus-visible:ring-offset-2 focus-visible:outline-none ${
                      index === 0
                        ? "bg-[#1E8A8A] text-white shadow-[0_12px_30px_rgba(30,138,138,0.18)]"
                        : "bg-white text-[#0C1E21] hover:-translate-y-0.5 hover:bg-[#1E8A8A] hover:text-white hover:shadow-md"
                    }`}
                    data-wow-duration="0.7s"
                    data-wow-delay={`${0.15 + index * 0.08}s`}
                  >
                    <div
                      className="rt-inline text-sm leading-5 font-semibold"
                      dangerouslySetInnerHTML={{ __html: label }}
                    />
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                        index === 0
                          ? "bg-white/15"
                          : "bg-[#ECF0F0] group-hover:bg-white/15"
                      }`}
                    >
                      <ArrowRight
                        size={15}
                        className={`transition-transform duration-300 ${
                          isRTL
                            ? "rotate-180 group-hover:-translate-x-1"
                            : "group-hover:translate-x-1"
                        }`}
                      />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* Local styles for Quill reset */}
      <style dangerouslySetInnerHTML={{ __html: SERVICE_DETAILS_STYLES }} />
    </section>
  );
}
