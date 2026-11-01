"use client";

import { Box, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useEffect, useState } from "react";

const defaultData = {
  translations: {
    en: {
      topTag: "CONTACT INFO",
      highlightedTitle: "Reach",
      mainTitle: "Out to Us",
      locationTitle: "Our Location",
      locationAddress: "993 Renner Burg, West Rond, MT 94251-030",
      emailTitle: "Email us",
      phoneTitle: "Call us",
      chatTitle: "Live chat",
      chatLinkText: "Need help?",
    },
  },
  shared: {
    email1: "support@bexon.com",
    email2: "info@bexon.com",
    phone1: "+1 (009) 544-7818",
    phone2: "+1 (009) 880-1810",
    chatEmail: "livechat@bexon.com",
    chatLinkUrl: "/contact",
  },
};

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

function parseAddressLines(address) {
  if (!address) return ["993 Renner Burg, West", "Rond, MT 94251-030"];
  if (address.includes("\n")) return address.split("\n");
  if (address.includes(",")) {
    const commaIdx = address.indexOf(",");
    return [
      address.substring(0, commaIdx).trim(),
      address.substring(commaIdx + 1).trim(),
    ];
  }
  return [address];
}

export default function ReachOut() {
  const [data, setData] = useState(defaultData);
  const [lang, setLang] = useState("en");

  // Sync language with site-language in localStorage
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

  // Fetch API data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/contactpage/contact-details", {
          cache: "no-store",
        });
        if (!res.ok) return;

        const json = await res.json();
        const payload = json?.data || json;

        if (payload && (payload.translations || payload.shared)) {
          setData(payload);
        }
      } catch (error) {
        console.error("Failed to fetch contact details:", error);
      }
    };

    fetchData();
  }, []);

  // Intersection observer for WOW animations
  useEffect(() => {
    const elements = document.querySelectorAll(".wow");

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target;

            const delay = element.getAttribute("data-wow-delay");
            const duration = element.getAttribute("data-wow-duration");

            if (delay) {
              element.style.animationDelay = delay;
            }

            if (duration) {
              element.style.animationDuration = duration;
            }

            element.classList.add("wow-visible");

            observer.unobserve(element);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -60px 0px",
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, [data]);

  const content =
    data?.translations?.[lang] ||
    data?.translations?.en ||
    defaultData.translations.en;

  const shared = data?.shared || defaultData.shared;
  const isRTL = lang === "ps" || lang === "fa";

  const CONTACT_CARDS = [
    {
      id: "location",
      icon: MapPin,
      title: content.locationTitle || "Our Location",
      lines: parseAddressLines(content.locationAddress),
    },
    {
      id: "email",
      icon: Mail,
      title: content.emailTitle || "Email us",
      lines: [shared.email1, shared.email2].filter(Boolean),
    },
    {
      id: "call",
      icon: Phone,
      title: content.phoneTitle || "Call us",
      lines: [shared.phone1, shared.phone2].filter(Boolean),
    },
    {
      id: "chat",
      icon: MessageCircle,
      title: content.chatTitle || "Live chat",
      lines: [shared.chatEmail].filter(Boolean),
      link: {
        label: content.chatLinkText || "Need help?",
        href: shared.chatLinkUrl || "/contact",
      },
    },
  ];

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      lang={lang}
      className="w-full overflow-hidden bg-[#EAEFEF] px-4 py-14 sm:px-6 sm:py-16 md:px-8 lg:px-10 lg:py-24 xl:px-16"
    >
      <div className="mx-auto w-full max-w-7xl">
        {/* Badge */}
        <div
          data-wow-duration="0.7s"
          data-wow-delay="0s"
          data-wow-offset="50"
          className="wow animate__animated animate__fadeInUp mx-auto flex w-fit items-center gap-2 rounded-sm border border-[#0C1E21]/10 bg-white px-4 py-2"
        >
          <Box size={20} className="text-[#1E8A8A]" aria-hidden="true" />

          <span className="text-sm font-bold tracking-[0.12em] text-[#102326] uppercase">
            {content.topTag}
          </span>
        </div>

        {/* Heading */}
        <h2
          data-wow-duration="0.8s"
          data-wow-delay="0.1s"
          data-wow-offset="50"
          className="wow animate__animated animate__fadeInUp mt-5 text-center text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl"
        >
          <span className="text-[#1E8A8A]">{content.highlightedTitle}</span>{" "}
          <span className="text-[#102326]">{content.mainTitle}</span>
        </h2>

        {/* Contact cards */}
        <div className="mt-12 grid grid-cols-1 gap-5 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
          {CONTACT_CARDS.map((card, index) => {
            const Icon = card.icon;

            return (
              <div
                key={card.id}
                data-wow-duration="0.8s"
                data-wow-delay={`${0.1 + index * 0.12}s`}
                data-wow-offset="60"
                className="wow animate__animated animate__fadeInUp rounded-3xl bg-white px-6 py-10 text-center transition-shadow duration-300 hover:shadow-[0_15px_35px_rgba(30,138,138,0.12)] sm:px-8"
              >
                {/* Icon */}
                <div
                  className="mx-auto mb-6 flex h-20 w-20 cursor-pointer items-center justify-center rounded-full bg-[#DCE6E6] text-[#1E8A8A] transition-all duration-300 hover:bg-[#1E8A8A] hover:text-white"
                  title={card.title}
                >
                  <Icon size={30} strokeWidth={1.8} aria-hidden="true" />
                </div>

                {/* Title */}
                <h3
                  data-wow-duration="0.7s"
                  data-wow-delay={`${0.2 + index * 0.12}s`}
                  data-wow-offset="50"
                  className="wow animate__animated animate__fadeInUp cursor-pointer text-xl font-bold text-[#102326] transition-colors duration-300 hover:text-[#1E8A8A] sm:text-2xl"
                >
                  {card.title}
                </h3>

                {/* Contact details */}
                <div className="mt-4 flex flex-col gap-1">
                  {card.lines.map((line, lineIndex) => (
                    <p
                      key={lineIndex}
                      data-wow-duration="0.6s"
                      data-wow-delay={`${
                        0.3 + index * 0.12 + lineIndex * 0.08
                      }s`}
                      data-wow-offset="40"
                      className="wow animate__animated animate__fadeInUp cursor-pointer text-sm leading-6 text-[#102326]/60 transition-colors duration-300 hover:text-[#1E8A8A] sm:text-base"
                    >
                      {line}
                    </p>
                  ))}
                </div>

                {/* Link */}
                {card.link && (
                  <a
                    href={card.link.href}
                    data-wow-duration="0.6s"
                    data-wow-delay={`${0.45 + index * 0.12}s`}
                    data-wow-offset="40"
                    className="wow animate__animated animate__fadeInUp mt-2 inline-block cursor-pointer text-sm font-bold text-[#1E8A8A] transition-colors duration-300 hover:text-[#0C1E21] hover:underline hover:underline-offset-4 sm:text-base"
                  >
                    {card.link.label}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
