"use client";

import RichText from "@/app/Components/RichText";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/* Helper to strip HTML tags for empty checks */
function stripHtml(val) {
  return String(val || "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

export default function ServiceDetailsFrontendView({ data, lang = "en" }) {
  const content = data?.[lang] || data?.en || {};
  const isRTL = lang === "ps" || lang === "fa";
  const heroImageUrl = data?.heroImage?.url || "";
  const services = data?.services || [];

  const mainTitleText = stripHtml(content.mainTitle);
  const highlightedTitleText = stripHtml(content.highlightedTitle);
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
            {(mainTitleText) && (
              <div
                role="heading"
                aria-level={1}
                className="wow animate__animated animate__fadeInUp xs:text-3xl text-[26px] leading-[1.18] font-medium tracking-tight text-[#102326] sm:text-4xl md:text-5xl"
                data-wow-duration="0.9s"
                data-wow-delay="0.15s"
              >
                {mainTitleText && (
                  <RichText content={content.mainTitle} inline={true} />
                )}{" "}
              </div>
            )}

            {desc1Text && (
              <div
                className="wow animate__animated animate__fadeInUp mt-5 sm:mt-6"
                data-wow-duration="0.8s"
                data-wow-delay="0.25s"
              >
                <RichText
                  content={content.description1}
                  className="text-sm leading-7 text-[#102326]/65 sm:text-base sm:leading-8"
                />
              </div>
            )}

            {desc2Text && (
              <div
                className="wow animate__animated animate__fadeInUp mt-4"
                data-wow-duration="0.8s"
                data-wow-delay="0.35s"
              >
                <RichText
                  content={content.description2}
                  className="text-sm leading-7 text-[#102326]/65 sm:text-base sm:leading-8"
                />
              </div>
            )}

            {desc3Text && (
              <div
                className="wow animate__animated animate__fadeInUp mt-4"
                data-wow-duration="0.8s"
                data-wow-delay="0.45s"
              >
                <RichText
                  content={content.description3}
                  className="text-sm leading-7 text-[#102326]/65 sm:text-base sm:leading-8"
                />
              </div>
            )}
          </div>
        </main>

        {/* Right sidebar */}
        <aside
          style={{ contain: "layout" }}
          className="w-full min-w-0 will-change-transform lg:sticky lg:top-10 lg:self-start"
        >
          <div
            className="wow animate__animated animate__fadeInRight rounded-2xl bg-[#ECF0F0] p-5 sm:rounded-3xl sm:p-6"
            data-wow-duration="0.9s"
            data-wow-delay="0.15s"
          >
            <div className="mb-5">
              {sidebarTagText && (
                <RichText
                  content={content.sidebarTag}
                  inline={true}
                  className="text-xs font-bold tracking-[0.18em] text-[#1E8A8A] uppercase"
                />
              )}
              {sidebarTitleText && (
                <RichText
                  content={content.sidebarTitle}
                  asHeading={true}
                  headingLevel={3}
                  className="mt-2 text-xl font-medium text-[#0C1E21] sm:text-2xl"
                />
              )}
            </div>

            <div className="flex flex-col gap-2">
              {services.map((service, index) => {
                const label =
                  service.translations?.[lang]?.label ||
                  service.translations?.en?.label ||
                  service.label?.[lang] ||
                  service.label ||
                  "";

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
                    <RichText
                      content={label}
                      inline={true}
                      className="text-sm leading-5 font-semibold"
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
    </section>
  );
}
