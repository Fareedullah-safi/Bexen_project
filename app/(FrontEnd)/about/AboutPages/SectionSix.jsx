"use client";

import { ArrowRight, Box, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const defaultHeader = {
  buttonLink: "/contact",
  translations: {
    en: {
      topTag: "COMMON QUESTIONS",
      mainTitle: "Need Help? Start",
      highlightedTitle: "Here...",
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

export default function SectionSix() {
  const [open, setOpen] = useState(null);
  const [lang, setLang] = useState("en");
  const [headerData, setHeaderData] = useState(defaultHeader);
  const [faqs, setFaqs] = useState(defaultFaqs);

  // Listen to site-language in localStorage and update instantly
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

  // Fetch APIs once
  useEffect(() => {
    const fetchHeader = async () => {
      try {
        const res = await fetch("/api/aboutpage/faqs");
        const json = await res.json();
        const payload = json?.data || json;
        if (!payload) return;

        if (payload.translations) {
          setHeaderData({
            buttonLink: payload.buttonLink || defaultHeader.buttonLink,
            translations: {
              en: {
                ...defaultHeader.translations.en,
                ...(payload.translations.en || {}),
              },
              ps: payload.translations.ps || undefined,
              fa: payload.translations.fa || undefined,
            },
          });
        } else {
          setHeaderData({
            buttonLink: payload.buttonLink || defaultHeader.buttonLink,
            translations: {
              en: {
                topTag:
                  pickLang(payload.topTag, "en") ||
                  defaultHeader.translations.en.topTag,
                mainTitle:
                  pickLang(payload.mainTitle || payload.headingLineOne, "en") ||
                  defaultHeader.translations.en.mainTitle,
                highlightedTitle:
                  pickLang(
                    payload.highlightedTitle || payload.headingLineTwo,
                    "en",
                  ) || defaultHeader.translations.en.highlightedTitle,
                description:
                  pickLang(payload.description, "en") ||
                  defaultHeader.translations.en.description,
                buttonText:
                  pickLang(payload.buttonText, "en") ||
                  defaultHeader.translations.en.buttonText,
              },
              ps: {
                topTag: pickLang(payload.topTag, "ps"),
                mainTitle: pickLang(
                  payload.mainTitle || payload.headingLineOne,
                  "ps",
                ),
                highlightedTitle: pickLang(
                  payload.highlightedTitle || payload.headingLineTwo,
                  "ps",
                ),
                description: pickLang(payload.description, "ps"),
                buttonText: pickLang(payload.buttonText, "ps"),
              },
              fa: {
                topTag: pickLang(payload.topTag, "fa"),
                mainTitle: pickLang(
                  payload.mainTitle || payload.headingLineOne,
                  "fa",
                ),
                highlightedTitle: pickLang(
                  payload.highlightedTitle || payload.headingLineTwo,
                  "fa",
                ),
                description: pickLang(payload.description, "fa"),
                buttonText: pickLang(payload.buttonText, "fa"),
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
          setFaqs(list);
        }
      } catch (error) {
        console.error("Failed to fetch homepage FAQs:", error);
      }
    };

    fetchHeader();
    fetchFaqs();
  }, []);

  // Data according to site-language
  const rawContent = headerData?.translations?.[lang];
  const content =
    rawContent && (rawContent.mainTitle || rawContent.topTag)
      ? { ...defaultHeader.translations.en, ...rawContent }
      : headerData?.translations?.en || defaultHeader.translations.en;

  const isRTL = lang === "ps" || lang === "fa";
  const buttonLink = headerData.buttonLink || "/contact";

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      lang={lang}
      className="relative w-full overflow-hidden bg-[#ECF0F0] px-4 py-16 sm:px-6 sm:py-20 md:px-8 lg:px-10 lg:py-24 xl:px-16"
    >
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
              <span className="text-zinc-900 uppercase">{content.topTag}</span>
            </span>
          </div>

          <h2
            data-wow-duration="0.9s"
            data-wow-delay="0.15s"
            data-wow-offset="100"
            className="wow animate__animated animate__fadeInLeft mt-6 max-w-xl text-4xl leading-[1.05] font-medium tracking-tight text-[#102326] sm:text-5xl lg:text-[56px]"
          >
            {content.mainTitle}{" "}
            <span className="text-[#1E8A8A]">{content.highlightedTitle}</span>
          </h2>

          <p
            data-wow-duration="0.9s"
            data-wow-delay="0.28s"
            data-wow-offset="100"
            className="wow animate__animated animate__fadeInUp mt-6 max-w-lg text-sm leading-7 text-[#102326]/60 sm:text-base sm:leading-8"
          >
            {content.description}
          </p>

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
                  <span className="block whitespace-nowrap transition-transform duration-400 ease-in-out [text-shadow:0_30px_0_currentColor] group-hover/button:-translate-y-[30px]">
                    {content.buttonText}
                  </span>
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
                  key={faq.id || question || index}
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
                    <span className="pr-2 text-base leading-7 font-semibold text-[#102326] sm:text-lg md:text-xl">
                      {question}
                    </span>

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

                      <p className="pt-4 pb-5 text-sm leading-7 text-zinc-500 sm:pb-6 sm:text-base sm:leading-8">
                        {answer}
                      </p>
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
