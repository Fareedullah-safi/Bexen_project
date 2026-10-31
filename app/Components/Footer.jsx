"use client";

import ScrollProgressButton from "@/app/Components/ScrollProgressButton";
import { Box, Mail, Phone, Send } from "lucide-react";
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

// ==========================================
// 1. SOCIAL ICONS MAP
// ==========================================
const SOCIAL_ICON_MAP = {
  facebook: { name: "Facebook", icon: <FaFacebookF size={16} /> },
  instagram: { name: "Instagram", icon: <FaInstagram size={16} /> },
  x: { name: "X (Twitter)", icon: <FaXTwitter size={16} /> },
  linkedin: { name: "LinkedIn", icon: <FaLinkedinIn size={16} /> },
  youtube: { name: "YouTube", icon: <FaYoutube size={16} /> },
  github: { name: "GitHub", icon: <FaGithub size={16} /> },
  whatsapp: { name: "WhatsApp", icon: <FaWhatsapp size={16} /> },
};

const isValidSocialUrl = (url) => {
  const value = String(url || "").trim();
  return value !== "" && value !== "#";
};

export default function Footer() {
  // ==========================================
  // 2. STATE
  // ==========================================
  const [lang, setLang] = useState("en");
  const [footerData, setFooterData] = useState(null);
  const [navItems, setNavItems] = useState([]);
  const [navLogo, setNavLogo] = useState("");

  const isRTL = lang === "ps" || lang === "fa";
  const currentYear = new Date().getFullYear();

  // ==========================================
  // 3. LOAD LANGUAGE + API DATA
  // ==========================================
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

    // Fetch Footer Data
    fetch("/api/footer")
      .then((res) =>
        res.ok
          ? res.json()
          : fetch("/api/footerandprofile").then((r) => r.json()),
      )
      .then((json) => {
        const data = json?.data || json;
        if (data && typeof data === "object") setFooterData(data);
      })
      .catch(() => {});

    // Fetch Navbar Data (For Navbar Logo & Links)
    fetch("/api/navigation")
      .then((res) =>
        res.ok ? res.json() : fetch("/api/navbar").then((r) => r.json()),
      )
      .then((json) => {
        const data = json?.data || json;
        if (data?.items) setNavItems(data.items);
        else if (Array.isArray(data)) setNavItems(data);

        // ✅ Get Navbar Logo
        if (data?.logo) setNavLogo(data.logo);
      })
      .catch(() => {});

    return () => {
      window.removeEventListener("site-language-change", onLangChange);
      window.removeEventListener("storage", onLangChange);
    };
  }, []);

  // ==========================================
  // 4. DYNAMIC VALUES FROM DB
  // ==========================================
  const logo = navLogo || footerData?.logo || "";
  const projectName = footerData?.projectName || "Bexon";

  const description =
    footerData?.description?.[lang] ||
    footerData?.description?.en ||
    "Developing personalize our customer journeys to increase satisfaction & loyalty of our expansion.";

  const phone = footerData?.contact?.phone || "";
  const email = footerData?.contact?.email || "";

  const newsletterHeading =
    footerData?.newsletter?.heading?.[lang] ||
    footerData?.newsletter?.heading?.en ||
    "Subscribe to Our Newsletter.";

  const newsletterPlaceholder =
    footerData?.newsletter?.placeholder?.[lang] ||
    footerData?.newsletter?.placeholder?.en ||
    "Enter email";

  const newsletterTerms =
    footerData?.newsletter?.terms?.[lang] ||
    footerData?.newsletter?.terms?.en ||
    "Agree to our Terms & Condition?";

  // Social icons filtered from DB
  const socials = useMemo(() => {
    const dbSocials = footerData?.socials || {};

    return Object.keys(SOCIAL_ICON_MAP)
      .map((key) => {
        const href = dbSocials?.[key];
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

  // Navbar Links marked with showInFooter
  const allQuickLinks = useMemo(() => {
    const links = [];

    (navItems || []).forEach((item) => {
      if (item?.showInFooter) {
        links.push({
          id: item.id || item._id || Math.random(),
          href: item.href || "#",
          label:
            item?.translations?.[lang]?.label ||
            item?.translations?.en?.label ||
            "Link",
        });
      }

      (item?.children || []).forEach((sub) => {
        if (sub?.showInFooter) {
          links.push({
            id: sub.id || sub._id || Math.random(),
            href: sub.href || "#",
            label:
              sub?.translations?.[lang]?.label ||
              sub?.translations?.en?.label ||
              "Link",
          });
        }
      });
    });

    return links;
  }, [navItems, lang]);

  // Split links 50/50 into two columns
  const middleIndex = Math.ceil(allQuickLinks.length / 2);
  const column1Links = allQuickLinks.slice(0, middleIndex);
  const column2Links = allQuickLinks.slice(middleIndex);

  // ==========================================
  // 5. RENDER
  // ==========================================
  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="relative z-10 -mt-24 w-full bg-[#e8eeee] px-3 pb-3 sm:-mt-32 sm:px-4 sm:pb-4 lg:-mt-60"
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#dce8e8] sm:rounded-3xl">
        {/* Repeating Subtle Striped Pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, #000 0, #000 1px, transparent 1px, transparent 12px)",
          }}
        />

        {/* Content Wrapper */}
        <div className="relative px-5 pt-20 pb-10 sm:px-8 sm:pt-28 md:pt-36 lg:px-16 lg:pt-60">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 lg:flex lg:grid-cols-none lg:flex-row lg:justify-between lg:gap-10">
            {/* Box 1 - Clean Standalone Logo & Description */}
            <div
              className="wow animate__animated animate__fadeInUp flex flex-col items-start gap-5 sm:col-span-2 sm:gap-6 lg:max-w-sm lg:flex-1"
              data-wow-duration="0.8s"
              data-wow-delay="0.1s"
            >
              {/* Clean Navbar-Style Logo (No background box) */}
              <Link
                href="/"
                className="inline-block transition-transform duration-300 hover:scale-105"
              >
                {logo ? (
                  <img
                    src={logo}
                    alt="Logo"
                    className="h-10 w-auto max-w-[180px] object-contain sm:h-12"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-2xl font-bold text-[#0C1E21]">
                    <Box size={28} className="text-[#1D8B8A]" />
                    <span>{projectName}</span>
                  </div>
                )}
              </Link>

              {/* Dynamic Description */}
              <p className="max-w-md text-sm leading-relaxed text-[#0C1E21]/70 sm:text-base">
                {description}
              </p>
            </div>

            {/* Box 2 - Quick Links (Column 1) */}
            <div
              className="wow animate__animated animate__fadeInUp flex flex-col lg:flex-1"
              data-wow-duration="0.8s"
              data-wow-delay="0.25s"
            >
              <h3 className="mb-5 text-xl font-bold text-[#0C1E21] sm:mb-7 sm:text-2xl">
                Quick Links
              </h3>
              <ul className="flex flex-col gap-3 sm:gap-4">
                {column1Links.length > 0 ? (
                  column1Links.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className="text-sm text-[#0C1E21]/70 transition-colors duration-300 hover:text-[#1D8B8A] sm:text-[17px]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-[#0C1E21]/50 sm:text-[17px]">
                    No links
                  </li>
                )}
              </ul>
            </div>

            {/* Box 3 - Resources (Column 2) */}
            <div
              className="wow animate__animated animate__fadeInUp flex flex-col lg:flex-1"
              data-wow-duration="0.8s"
              data-wow-delay="0.4s"
            >
              <h3 className="mb-5 text-xl font-bold text-[#0C1E21] sm:mb-7 sm:text-2xl">
                Resources
              </h3>
              <ul className="flex flex-col gap-3 sm:gap-4">
                {column2Links.length > 0 ? (
                  column2Links.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className="text-sm text-[#0C1E21]/70 transition-colors duration-300 hover:text-[#1D8B8A] sm:text-[17px]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-[#0C1E21]/50 sm:text-[17px]">
                    -
                  </li>
                )}
              </ul>
            </div>

            {/* Box 4 - Newsletter */}
            <div
              className="wow animate__animated animate__fadeInUp flex flex-col gap-4 sm:col-span-2 sm:gap-5 lg:max-w-sm lg:flex-1"
              data-wow-duration="0.8s"
              data-wow-delay="0.55s"
            >
              <h3 className="text-2xl leading-tight font-semibold text-[#0C1E21] sm:text-3xl">
                {newsletterHeading}
              </h3>

              <form
                className="flex h-14 w-full items-center rounded-xl bg-white px-4 shadow-sm sm:h-16 sm:px-5"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder={newsletterPlaceholder}
                  className="h-full flex-1 bg-transparent text-sm text-[#0C1E21] outline-none placeholder:text-[#0C1E21]/50 sm:text-base"
                />
                <span className="mx-2 h-6 w-px bg-gray-200 sm:mx-3" />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center text-[#1D8B8A] transition-transform duration-300 hover:scale-110"
                >
                  <Send size={20} fill="#1D8B8A" />
                </button>
              </form>

              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#0C1E21]/70 sm:text-[15px]">
                <input
                  type="checkbox"
                  className="h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 accent-[#1D8B8A]"
                />
                <span>{newsletterTerms}</span>
              </label>
            </div>
          </div>

          {/* Divider Line */}
          <div
            className="wow animate__animated animate__fadeIn mx-auto mt-12 max-w-7xl border-t border-black/10 sm:mt-16"
            data-wow-duration="1s"
            data-wow-delay="0.7s"
          />

          {/* Bottom Bar: Contact Info, Socials, Copyright */}
          <div
            className="wow animate__animated animate__fadeInUp mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 pt-8 lg:flex-row"
            data-wow-duration="0.8s"
            data-wow-delay="0.8s"
          >
            {/* Phone & Email */}
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
              {!!phone && (
                <a
                  href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                  className="flex items-center gap-2 text-sm font-medium text-[#0C1E21] sm:text-[15px]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1D8B8A] text-white sm:h-9 sm:w-9">
                    <Phone size={14} />
                  </span>
                  {phone}
                </a>
              )}

              {!!email && (
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-2 text-sm font-medium text-[#0C1E21] sm:text-[15px]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1D8B8A] text-white sm:h-9 sm:w-9">
                    <Mail size={14} />
                  </span>
                  {email}
                </a>
              )}
            </div>

            {/* Social Icons from DB */}
            <div className="flex flex-wrap justify-center gap-3">
              {socials.map((social) => (
                <a
                  key={social.key}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.name}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/10 text-[#0C1E21]/60 transition-colors duration-300 hover:bg-[#1D8B8A] hover:text-white sm:h-10 sm:w-10"
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {/* Copyright with Dynamic Current Year */}
            <p className="text-center text-sm text-[#0C1E21]/60 sm:text-[15px]">
              © {currentYear}{" "}
              <span className="font-semibold text-[#0C1E21]">
                {projectName}
              </span>{" "}
              All right reserved
            </p>
          </div>
        </div>

        {/* Scroll To Top Button */}
        <ScrollProgressButton />
      </div>
    </section>
  );
}
