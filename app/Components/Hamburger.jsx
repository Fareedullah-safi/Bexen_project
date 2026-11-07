"use client";

import { ChevronDown, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FaFacebookF,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

// Same 7 icons as Footer
const SOCIAL_ICON_MAP = {
  facebook: { name: "Facebook", icon: <FaFacebookF size={15} /> },
  instagram: { name: "Instagram", icon: <FaInstagram size={17} /> },
  x: { name: "X", icon: <FaXTwitter size={15} /> },
  linkedin: { name: "LinkedIn", icon: <FaLinkedinIn size={16} /> },
  youtube: { name: "YouTube", icon: <FaYoutube size={16} /> },
  github: { name: "GitHub", icon: <FaGithub size={15} /> },
  whatsapp: { name: "WhatsApp", icon: <FaWhatsapp size={16} /> },
};

// Manual UI translations
const UI_TEXT = {
  en: {
    openMenu: "Open menu",
    closeMenu: "Close menu",
    search: "Search",
    searchPlaceholder: "Search here...",
    searchHeading: "Search Now!",
    contactInfo: "Contact Info",
    phone: "Phone",
    email: "Email",
    location: "Location",
    followUs: "Follow Us",
    noMenuItems: "No menu items",
    link: "Link",
  },

  ps: {
    openMenu: "مینو پرانیزئ",
    closeMenu: "مینو وتړئ",
    search: "لټون",
    searchPlaceholder: "دلته لټون وکړئ...",
    searchHeading: "همدا اوس لټون وکړئ!",
    contactInfo: "د اړیکو معلومات",
    phone: "د تلیفون شمېره",
    email: "برېښنالیک",
    location: "پته",
    followUs: "موږ تعقیب کړئ",
    noMenuItems: "د مینو هېڅ برخه نشته",
    link: "لینک",
  },

  fa: {
    openMenu: "باز کردن منو",
    closeMenu: "بستن منو",
    search: "جستجو",
    searchPlaceholder: "اینجا جستجو کنید...",
    searchHeading: "همین حالا جستجو کنید!",
    contactInfo: "اطلاعات تماس",
    phone: "شماره تماس",
    email: "ایمیل",
    location: "آدرس",
    followUs: "ما را دنبال کنید",
    noMenuItems: "هیچ موردی در منو وجود ندارد",
    link: "پیوند",
  },
};

// Manual description translations
const DESCRIPTION_TEXT = {
  en: "Developing personalized customer journeys to increase satisfaction and loyalty, recognized by industry leaders.",

  ps: "موږ د پیرودونکو لپاره ځانګړې تجربې رامنځته کوو، ترڅو د هغوی رضایت او وفاداري زیاته کړو؛ هغه خدمتونه چې د صنعت د مخکښو متخصصینو له خوا پېژندل شوي دي.",

  fa: "ما تجربه‌های شخصی‌سازی‌شده‌ای برای مشتریان ایجاد می‌کنیم تا رضایت و وفاداری آن‌ها را افزایش دهیم؛ خدماتی که مورد تأیید پیشگامان صنعت قرار گرفته‌اند.",
};

const isValidSocialUrl = (url) => {
  const v = String(url || "").trim();
  return v !== "" && v !== "#";
};

export default function Hamburger() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [lang, setLang] = useState("en");
  const [navData, setNavData] = useState(null);
  const [footerData, setFooterData] = useState(null);

  // ----------------------------------------
  // 1. Load language + API data
  // ----------------------------------------
  useEffect(() => {
    const saved = localStorage.getItem("site-language") || "en";
    setLang(saved);

    const onLangChange = (e) => {
      const next =
        e?.detail?.language || localStorage.getItem("site-language") || "en";

      setLang(next);
    };

    window.addEventListener("site-language-change", onLangChange);
    window.addEventListener("storage", onLangChange);

    // Navbar
    fetch("/api/navbar")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const data = json?.data || json;
        if (data) setNavData(data);
      })
      .catch(() => {});

    // Footer
    fetch("/api/footer")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const data = json?.data || json;
        if (data) setFooterData(data);
      })
      .catch(() => {});

    return () => {
      window.removeEventListener("site-language-change", onLangChange);
      window.removeEventListener("storage", onLangChange);
    };
  }, []);

  // ----------------------------------------
  // 2. Manual translations
  // ----------------------------------------
  const translations = UI_TEXT[lang] || UI_TEXT.en;

  // ----------------------------------------
  // 3. Safe values from DB
  // ----------------------------------------
  const logo =
    navData?.logo ||
    "https://themejunction.net/html/bexon/demo/assets/images/logos/logo-2.webp";

  const searchPlaceholder =
    navData?.search?.placeholder?.[lang] || translations.searchPlaceholder;

  const searchHeading =
    navData?.search?.heading?.[lang] || translations.searchHeading;

  // Description: Database translation first,
  // then manual translation, then English fallback.
  const description =
    footerData?.description?.[lang] ||
    DESCRIPTION_TEXT[lang] ||
    footerData?.description?.en ||
    DESCRIPTION_TEXT.en;

  const phone = footerData?.contact?.phone || "";
  const email = footerData?.contact?.email || "";
  const location = footerData?.contact?.location || "";

  // Menu links from Navbar
  const navItems = useMemo(() => {
    return (navData?.items || []).map((item) => {
      const children = (item?.children || []).map((sub) => ({
        id: sub.id || sub._id,
        href: sub.href || "#",
        label:
          sub?.translations?.[lang]?.label ||
          sub?.translations?.en?.label ||
          translations.link,
      }));

      return {
        id: item.id || item._id,
        href: item.href || "#",
        label:
          item?.translations?.[lang]?.label ||
          item?.translations?.en?.label ||
          translations.link,
        hasDropdown: Boolean(item.hasDropdown && children.length > 0),
        children,
      };
    });
  }, [navData, lang, translations]);

  // Social icons from Footer (hide if empty or #)
  const socials = useMemo(() => {
    const db = footerData?.socials || {};

    return Object.keys(SOCIAL_ICON_MAP)
      .map((key) => {
        const href = db?.[key];

        if (!isValidSocialUrl(href)) return null;

        return {
          key,
          href: href.trim(),
          name: SOCIAL_ICON_MAP[key].name,
          icon: SOCIAL_ICON_MAP[key].icon,
        };
      })
      .filter(Boolean);
  }, [footerData]);

  const isRTL = lang === "ps" || lang === "fa";

  // ----------------------------------------
  // 4. Open / Close helpers
  // ----------------------------------------
  const openMenu = () => {
    setIsMenuOpen(true);
    document.body.classList.add("overflow-hidden");
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setOpenAccordion(null);
    document.body.classList.remove("overflow-hidden");
  };

  const toggleAccordion = (id) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  // ----------------------------------------
  // 5. RENDER
  // ----------------------------------------
  return (
    <div className="relative">
      {/* Hamburger Button */}
      {!isMenuOpen && (
        <button
          type="button"
          onClick={openMenu}
          aria-label={translations.openMenu}
          className="group relative z-60 flex cursor-pointer flex-col space-y-1.5 rounded-md bg-[#1E8A8A] p-3 text-white lg:bg-white lg:p-0"
        >
          <span className="h-0.5 w-8 bg-gray-100 transition-all duration-300 lg:bg-black lg:group-hover:bg-[#1E8A8A]" />
          <span className="h-0.5 w-6 bg-gray-100 transition-all duration-300 group-hover:w-8 lg:bg-black lg:group-hover:bg-[#1E8A8A]" />
          <span className="h-0.5 w-8 bg-gray-100 transition-all duration-300 lg:bg-black lg:group-hover:bg-[#1E8A8A]" />
        </button>
      )}

      {/* Subtle Backdrop */}
      {isMenuOpen && (
        <div
          onClick={closeMenu}
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300"
        />
      )}

      {/* Menu Panel — mouse leave closes on desktop */}
      {isMenuOpen && (
        <div
          dir={isRTL ? "rtl" : "ltr"}
          onMouseLeave={closeMenu}
          className="scrollbar-cyan fixed top-5 right-5 z-50 max-h-[calc(100vh-40px)] w-[480px] max-w-[calc(100vw-30px)] overflow-y-auto rounded-xl bg-[#0C2426] text-white shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex h-24 items-center justify-between border-b border-white/10 bg-[#0C2426] px-7">
            <Link href="/" onClick={closeMenu}>
              {logo ? (
                <Image
                  src={logo}
                  alt="Logo"
                  width={150}
                  height={60}
                  className="h-10 w-auto object-contain sm:h-12"
                  unoptimized
                />
              ) : (
                <span className="text-xl font-bold text-white">Bexon</span>
              )}
            </Link>

            <button
              type="button"
              onClick={closeMenu}
              aria-label={translations.closeMenu}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 transition-all duration-300 hover:rotate-90 hover:bg-[#1E8A8A]"
            >
              <X size={22} />
            </button>
          </div>

          {/* Body */}
          <div className="p-7">
            {/* Nav links (mobile accordion) */}
            <nav className="mb-8 flex flex-col lg:hidden">
              {navItems.length > 0 ? (
                navItems.map((item) => (
                  <div key={item.id} className="border-b border-white/10">
                    {item.hasDropdown ? (
                      <>
                        <button
                          type="button"
                          onClick={() => toggleAccordion(item.id)}
                          className="flex w-full cursor-pointer items-center justify-between py-4 text-left text-lg font-semibold text-white transition-colors duration-300 hover:text-[#1E8A8A]"
                        >
                          <span>{item.label}</span>

                          <ChevronDown
                            size={20}
                            className={`transition-transform duration-300 ${
                              openAccordion === item.id ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            openAccordion === item.id
                              ? "max-h-60 pb-4 opacity-100"
                              : "max-h-0 opacity-0"
                          }`}
                        >
                          <div className="flex flex-col gap-3 pl-2">
                            {item.href && item.href !== "#" && (
                              <Link
                                href={item.href}
                                onClick={closeMenu}
                                className="text-md px-6 font-semibold text-gray-300 transition-colors duration-300 hover:text-[#1E8A8A]"
                              >
                                {item.label}
                              </Link>
                            )}

                            {item.children.map((sub) => (
                              <Link
                                key={sub.id}
                                href={sub.href}
                                onClick={closeMenu}
                                className="text-md px-6 font-semibold text-gray-300 transition-colors duration-300 hover:text-[#1E8A8A]"
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={closeMenu}
                        className="flex w-full items-center justify-between py-4 text-left text-lg font-semibold text-white transition-colors duration-300 hover:text-[#1E8A8A]"
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))
              ) : (
                <p className="py-4 text-sm text-gray-500">
                  {translations.noMenuItems}
                </p>
              )}
            </nav>

            {/* Description */}
            <div className="-mt-4 mb-8">
              <p className="text-[16px] leading-7 text-gray-400">
                {description}
              </p>
            </div>

            {/* Search */}
            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-white">
                {searchHeading}
              </h2>

              <form
                className="flex h-12 overflow-hidden rounded-lg bg-white"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  className="w-full px-4 text-sm text-[#0C1E21] outline-none placeholder:text-gray-500"
                />

                <button
                  type="submit"
                  aria-label={translations.search}
                  className="flex w-14 shrink-0 items-center justify-center bg-[#1E8A8A] text-white transition-colors duration-300 hover:bg-[#167272]"
                >
                  <Image
                    src="/icons/magnifiying-glass.png"
                    alt={translations.search}
                    width={20}
                    height={20}
                    className="h-5 w-5 brightness-0 invert"
                  />
                </button>
              </form>
            </div>

            {/* Contact */}
            <div className="mb-8">
              <h2 className="mb-5 text-2xl font-semibold text-white">
                {translations.contactInfo}
              </h2>

              <div className="space-y-5">
                {!!phone && (
                  <div>
                    <p className="mb-1 text-sm text-gray-400">
                      {translations.phone}
                    </p>

                    <a
                      href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                      className="text-base text-white transition-colors duration-300 hover:text-[#1E8A8A]"
                    >
                      {phone}
                    </a>
                  </div>
                )}

                {!!email && (
                  <div>
                    <p className="mb-1 text-sm text-gray-400">
                      {translations.email}
                    </p>

                    <a
                      href={`mailto:${email}`}
                      className="text-base text-white transition-colors duration-300 hover:text-[#1E8A8A]"
                    >
                      {email}
                    </a>
                  </div>
                )}

                {!!location && (
                  <div>
                    <p className="mb-1 text-sm text-gray-400">
                      {translations.location}
                    </p>

                    <p className="text-base leading-6 text-white">{location}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Socials */}
            {socials.length > 0 && (
              <div className="pb-3">
                <h2 className="mb-4 text-2xl font-semibold text-white">
                  {translations.followUs}
                </h2>

                <div className="flex flex-wrap gap-3">
                  {socials.map((s) => (
                    <a
                      key={s.key}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={s.name}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 hover:bg-[#1E8A8A]"
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
