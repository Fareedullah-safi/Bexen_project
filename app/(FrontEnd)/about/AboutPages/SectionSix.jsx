"use client";

import { sanitizeData } from "@/Lib/sanitizeText";
import { ArrowRight, Box, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const SECTION_SIX_STYLES = `
  .rt-inline p {
    display: inline;
    margin: 0 !important;
    padding: 0 !important;
  }
  .rt-inline h1,
  .rt-inline h2,
  .rt-inline h3,
  .rt-inline h4,
  .rt-inline h5,
  .rt-inline h6 {
    display: inline;
    margin: 0 !important;
    padding: 0 !important;
    font-size: inherit;
    font-weight: inherit;
    line-height: inherit;
  }
  .rt-desc p {
    margin: 0 0 0.5em 0 !important;
    padding: 0 !important;
  }
  .rt-desc p:last-child {
    margin-bottom: 0 !important;
  }
  .rt-tight p {
    margin: 0 !important;
    padding: 0 !important;
  }
  .rt-inline,
  .rt-desc,
  .rt-tight {
    overflow-wrap: break-word !important;
    word-break: normal !important;
  }
`;

const defaultHeader = {
  buttonLink: "/contact",
  translations: {
    en: {
      topTag: "COMMON QUESTIONS",
      title: 'Need Help? Start <span style="color:#1E8A8A">Here...</span>',
      description:
        "We stay ahead of the curve, leveraging cutting-edge technologies and strategies to keep you competitive.",
      buttonText: "Request a Call",
    },
  },
};

const defaultFaqs = [
  {
    id: "faq-1",
    question: { en: "What services does Bexon offer to clients?" },
    answer: {
      en: "Getting started is easy! Simply reach out to us through our contact form or give us a call, and we'll schedule a consultation to discuss your project and how we can best assist you.",
    },
  },
  {
    id: "faq-2",
    question: { en: "How do I get started with Corporate Business?" },
    answer: {
      en: "Getting started is easy! Simply reach out to us through our contact form or give us a call, and we'll schedule a consultation to discuss your project and how we can best assist you.",
    },
  },
  {
    id: "faq-3",
    question: { en: "How do you ensure the success of a project?" },
    answer: {
      en: "Our team keeps you informed throughout the process, ensuring quality control, clear communication, and timely delivery from beginning to end.",
    },
  },
  {
    id: "faq-4",
    question: { en: "How long will it take to complete my project?" },
    answer: {
      en: "The timeline depends on the size and complexity of your project. After understanding your requirements, we provide a clear estimated timeline.",
    },
  },
  {
    id: "faq-5",
    question: { en: "Can I track the progress of my project?" },
    answer: {
      en: "Yes, our team keeps you updated throughout the project so you can easily follow the progress and stay informed about important milestones.",
    },
  },
];

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

function pickLang(value, lang) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[lang] || value.en || "";
}

function resolveTitle(content) {
  if (content && content.title) return content.title;
  const main = content && content.mainTitle ? content.mainTitle : "";
  const hi =
    content && content.highlightedTitle ? content.highlightedTitle : "";
  if (main && hi) {
    return main + ' <span style="color:#1E8A8A">' + hi + "</span>";
  }
  if (main) return main;
  if (hi) return hi;
  return "";
}

export default function SectionSix() {
  const [open, setOpen] = useState(null);
  const [lang, setLang] = useState("en");
  const [headerData, setHeaderData] = useState(defaultHeader);
  const [faqs, setFaqs] = useState(defaultFaqs);

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
    const fetchHeader = async () => {
      try {
        const res = await fetch("/api/aboutpage/faqs");
        const json = await res.json();
        const payload = json?.data || json;
        if (!payload) return;

        const cleaned = sanitizeData(payload);

        if (cleaned.translations) {
          setHeaderData({
            buttonLink: cleaned.buttonLink || defaultHeader.buttonLink,
            translations: {
              en: {
                ...defaultHeader.translations.en,
                ...(cleaned.translations.en || {}),
              },
              ps: cleaned.translations.ps || undefined,
              fa: cleaned.translations.fa || undefined,
            },
          });
        } else {
          setHeaderData({
            buttonLink: cleaned.buttonLink || defaultHeader.buttonLink,
            translations: {
              en: {
                topTag:
                  pickLang(cleaned.topTag, "en") ||
                  defaultHeader.translations.en.topTag,
                title:
                  resolveTitle(cleaned) || defaultHeader.translations.en.title,
                description:
                  pickLang(cleaned.description, "en") ||
                  defaultHeader.translations.en.description,
                buttonText:
                  pickLang(cleaned.buttonText, "en") ||
                  defaultHeader.translations.en.buttonText,
              },
              ps: {
                topTag: pickLang(cleaned.topTag, "ps"),
                title: resolveTitle({
                  mainTitle: pickLang(
                    cleaned.mainTitle || cleaned.headingLineOne,
                    "ps",
                  ),
                  highlightedTitle: pickLang(
                    cleaned.highlightedTitle || cleaned.headingLineTwo,
                    "ps",
                  ),
                }),
                description: pickLang(cleaned.description, "ps"),
                buttonText: pickLang(cleaned.buttonText, "ps"),
              },
              fa: {
                topTag: pickLang(cleaned.topTag, "fa"),
                title: resolveTitle({
                  mainTitle: pickLang(
                    cleaned.mainTitle || cleaned.headingLineOne,
                    "fa",
                  ),
                  highlightedTitle: pickLang(
                    cleaned.highlightedTitle || cleaned.headingLineTwo,
                    "fa",
                  ),
                }),
                description: pickLang(cleaned.description, "fa"),
                buttonText: pickLang(cleaned.buttonText, "fa"),
              },
            },
          });
        }
      } catch (error) {
        console.error("Failed to fetch About FAQ header:", error);
      }
    };

    const fetchFaqs = async () => {
      try {
        const res = await fetch("/api/homepage/faq");
        const json = await res.json();
        const payload = json?.data || json;
        const list = Array.isArray(payload)
          ? payload
          : payload?.faqs || payload?.data?.faqs || [];

        if (Array.isArray(list) && list.length > 0) {
          setFaqs(sanitizeData(list));
        }
      } catch (error) {
        console.error("Failed to fetch homepage FAQs:", error);
      }
    };

    fetchHeader();
    fetchFaqs();
  }, []);

  const rawContent = headerData?.translations?.[lang];
  const content =
    rawContent &&
    (rawContent.title || rawContent.mainTitle || rawContent.topTag)
      ? sanitizeData({ ...defaultHeader.translations.en, ...rawContent })
      : sanitizeData(
          headerData?.translations?.en || defaultHeader.translations.en,
        );

  const titleHtml = resolveTitle(content);
  const isRTL = lang === "ps" || lang === "fa";
  const buttonLink = headerData.buttonLink || "/contact";

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      lang={lang}
      className="relative w-full overflow-hidden bg-[#ECF0F0] px-4 py-16 sm:px-6 sm:py-20 md:px-8 lg:px-10 lg:py-24 xl:px-16"
    >
      <style dangerouslySetInnerHTML={{ __html: SECTION_SIX_STYLES }} />

      <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[#1E8A8A]/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-[#1E8A8A]/5 blur-3xl" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-14 xl:gap-20">
        <div className="flex flex-col">
          <div
            data-wow-duration="0.8s"
            data-wow-delay="0.05s"
            data-wow-offset="100"
            className="wow animate__animated animate__fadeInDown"
          >
            <span className="group inline-flex w-fit items-center gap-2 rounded-full border border-[#1E8A8A]/15 bg-white/70 px-4 py-2 text-xs font-bold tracking-[0.14em] text-[#1E8A8A] shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#1E8A8A]/30 hover:shadow-md sm:text-sm">
              <Box
                size={17}
                className="transition-transform duration-500 group-hover:rotate-180"
              />
              <span
                className="rt-inline rt-tight text-zinc-900 uppercase"
                dangerouslySetInnerHTML={{ __html: content.topTag || "" }}
              />
            </span>
          </div>

          <div
            data-wow-duration="0.9s"
            data-wow-delay="0.15s"
            data-wow-offset="100"
            role="heading"
            aria-level={2}
            className="wow animate__animated animate__fadeInLeft rt-inline rt-tight mt-6 max-w-xl text-4xl leading-[1.05] font-medium tracking-tight text-[#102326] sm:text-5xl lg:text-[56px]"
            dangerouslySetInnerHTML={{ __html: titleHtml || "" }}
          />

          <div
            data-wow-duration="0.9s"
            data-wow-delay="0.28s"
            data-wow-offset="100"
            className="wow animate__animated animate__fadeInUp rt-desc mt-6 max-w-lg text-sm leading-7 text-[#102326]/60 sm:text-base sm:leading-8"
            dangerouslySetInnerHTML={{ __html: content.description || "" }}
          />

          <div
            data-wow-duration="0.9s"
            data-wow-delay="0.4s"
            data-wow-offset="80"
            className="wow animate__animated animate__fadeInUp mt-8 w-full sm:mt-9"
          >
            <Link href={buttonLink}>
              <button
                type="button"
                className={`group/button flex h-14 w-full max-w-[230px] cursor-pointer items-center justify-between overflow-hidden rounded-full bg-[#1E8A8A] px-1.5 py-1.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(30,138,138,0.18)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#177979] hover:shadow-[0_18px_40px_rgba(30,138,138,0.28)] sm:h-15 sm:max-w-[245px] sm:text-base ${
                  isRTL ? "pr-6 sm:pr-7" : "pl-6 sm:pl-7"
                }`}
              >
                <span className="overflow-hidden leading-none">
                  <span
                    className="rt-inline rt-tight block whitespace-nowrap transition-transform duration-400 ease-in-out [text-shadow:0_30px_0_currentColor] group-hover/button:-translate-y-[30px]"
                    dangerouslySetInnerHTML={{
                      __html: content.buttonText || "",
                    }}
                  />
                </span>

                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0C1E21] transition-transform duration-300 group-hover/button:scale-105 sm:h-12 sm:w-12">
                  <ArrowRight
                    size={19}
                    className={`${
                      isRTL
                        ? "rotate-135 group-hover/button:rotate-180"
                        : "-rotate-45 group-hover/button:rotate-0"
                    } text-white transition-transform duration-300 ease-in-out`}
                  />
                </span>
              </button>
            </Link>
          </div>
        </div>

        <div className="w-full">
          <div className="flex flex-col gap-3">
            {faqs.map((faq, index) => {
              const isOpen = open === index;
              const question = pickLang(faq.question, lang);
              const answer = pickLang(faq.answer, lang);

              return (
                <div
                  key={faq.id || index}
                  data-wow-duration="0.8s"
                  data-wow-delay={`${0.12 + index * 0.1}s`}
                  data-wow-offset="100"
                  className="wow animate__animated animate__fadeInRight overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_8px_30px_rgba(12,30,33,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_38px_rgba(12,30,33,0.08)]"
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className={`flex w-full cursor-pointer items-center justify-between gap-5 px-5 py-5 sm:px-6 sm:py-6 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    <span
                      className="rt-inline rt-tight pr-2 text-base leading-7 font-semibold text-[#102326] sm:text-lg md:text-xl"
                      dangerouslySetInnerHTML={{ __html: question || "" }}
                    />

                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-500 sm:h-11 sm:w-11 ${
                        isOpen
                          ? "rotate-180 border-[#1E8A8A] bg-[#1E8A8A] text-white"
                          : "border-zinc-200 bg-white text-[#102326] hover:border-[#1E8A8A] hover:bg-[#1E8A8A] hover:text-white"
                      }`}
                    >
                      {isOpen ? (
                        <Minus size={19} strokeWidth={2} />
                      ) : (
                        <Plus size={19} strokeWidth={2} />
                      )}
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-500 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden px-5 sm:px-6">
                      <div className="flex items-center gap-2">
                        <span className="h-1 w-1 shrink-0 rounded-full bg-[#1E8A8A]" />
                        <div className="flex-1 border-t border-dashed border-zinc-300" />
                        <span className="h-1 w-1 shrink-0 rounded-full bg-[#1E8A8A]" />
                      </div>

                      <div
                        className="rt-desc pt-4 pb-5 text-sm leading-7 text-zinc-500 sm:pb-6 sm:text-base sm:leading-8"
                        dangerouslySetInnerHTML={{ __html: answer || "" }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
