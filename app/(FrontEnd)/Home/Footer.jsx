"use client";

import { Box, Send, ArrowUp, Phone, Mail } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaLinkedinIn,
} from "react-icons/fa6";
import Image from "next/image";
import ScrollProgressButton from "@/app/Components/ScrollProgressButton";

export default function Footer() {
  const services = [
    "Customer Experience",
    "Training Programs",
    "Business Strategy",
    "Training Program",
    "ESG Consulting",
    "Development Hub",
  ];

  const resources = [
    { name: "Contact us" },
    { name: "Team Member" },
    { name: "Recognitions" },
    { name: "Careers", badge: "New" },
    { name: "News" },
    { name: "Feedback" },
  ];

  const socials = [
    { name: "Facebook", icon: <FaFacebookF size={16} />, href: "#" },
    { name: "Instagram", icon: <FaInstagram size={16} />, href: "#" },
    { name: "Twitter", icon: <FaXTwitter size={16} />, href: "#" },
    { name: "LinkedIn", icon: <FaLinkedinIn size={16} />, href: "#" },
  ];

  return (
    <section className="relative z-10 -mt-24 w-full bg-[#e8eeee] px-3 pb-3 sm:-mt-32 sm:px-4 sm:pb-4 lg:-mt-60">
      <div className="relative overflow-hidden rounded-2xl bg-[#dce8e8] sm:rounded-3xl">
        {/* Diagonal stripe pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, #000 0, #000 1px, transparent 1px, transparent 12px)",
          }}
        />

        <div className="relative px-5 pt-20 pb-10 sm:px-8 sm:pt-28 md:pt-36 lg:px-16 lg:pt-60">
          {/* 4 Boxes Grid/Flex Container */}
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 lg:flex lg:grid-cols-none lg:flex-row lg:justify-between lg:gap-10">
            {/* Box 1 - Logo, Description, Awards */}
            <div className="flex flex-col gap-5 sm:col-span-2 sm:gap-6 lg:max-w-sm lg:flex-1">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1D8B8A] shadow-md shadow-[#1D8B8A]/20 sm:h-13 sm:w-13">
                  <Box
                    size={22}
                    className="text-white sm:size-6"
                    strokeWidth={2}
                  />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-[#0C1E21] sm:text-4xl">
                  Bexon
                </h2>
              </div>

              <p className="max-w-md text-sm leading-relaxed text-[#0C1E21]/70 sm:text-base">
                Developing personalze our customer journeys to increase
                satisfaction & loyalty of our expansion.
              </p>

              <div className="mt-1 flex gap-3 sm:mt-2 sm:gap-4">
                <Image
                  src="https://themejunction.net/html/bexon/demo/assets/images/footer/award-logo-1.webp"
                  width={100}
                  height={100}
                  alt="Clutch Award"
                  className="h-16 w-16 object-contain sm:h-20 sm:w-20"
                />
                <Image
                  src="https://themejunction.net/html/bexon/demo/assets/images/footer/award-logo-2.webp"
                  width={100}
                  height={100}
                  alt="Awwwards"
                  className="h-16 w-16 object-contain sm:h-20 sm:w-20"
                />
              </div>
            </div>

            {/* Box 2 - Services */}
            <div className="flex flex-col lg:flex-1">
              <h3 className="mb-5 text-xl font-bold text-[#0C1E21] sm:mb-7 sm:text-2xl">
                Services
              </h3>
              <ul className="flex flex-col gap-3 sm:gap-4">
                {services.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-[#0C1E21]/70 transition-colors duration-300 hover:text-[#1D8B8A] sm:text-[17px]"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Box 3 - Resources */}
            <div className="flex flex-col lg:flex-1">
              <h3 className="mb-5 text-xl font-bold text-[#0C1E21] sm:mb-7 sm:text-2xl">
                Resources
              </h3>
              <ul className="flex flex-col gap-3 sm:gap-4">
                {resources.map((item) => (
                  <li key={item.name}>
                    <a
                      href="#"
                      className="flex items-center gap-2 text-sm text-[#0C1E21]/70 transition-colors duration-300 hover:text-[#1D8B8A] sm:text-[17px]"
                    >
                      {item.name}
                      {item.badge && (
                        <span className="rounded-full bg-[#1D8B8A] px-2 py-0.5 text-[9px] font-bold text-white uppercase sm:text-[10px]">
                          {item.badge}
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Box 4 - Newsletter */}
            <div className="flex flex-col gap-4 sm:col-span-2 sm:gap-5 lg:max-w-sm lg:flex-1">
              <h3 className="text-2xl leading-tight font-semibold text-[#0C1E21] sm:text-3xl">
                Subscribe to Our Newsletter.
              </h3>

              <form className="flex h-14 w-full items-center rounded-xl bg-white px-4 shadow-sm sm:h-16 sm:px-5">
                <input
                  type="email"
                  placeholder="Enter email"
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
                <span>
                  Agree to our{" "}
                  <span className="font-semibold text-[#0C1E21]">
                    Terms & Condition?
                  </span>
                </span>
              </label>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-auto mt-12 max-w-7xl border-t border-black/10 sm:mt-16" />

          {/* Bottom Bar */}
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 pt-8 lg:flex-row">
            {/* Contact Info */}
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
              <a
                href="tel:+10095447818"
                className="flex items-center gap-2 text-sm font-medium text-[#0C1E21] sm:text-[15px]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1D8B8A] text-white sm:h-9 sm:w-9">
                  <Phone size={14} />
                </span>
                +1 (009) 544-7818
              </a>
              <a
                href="mailto:info@bexon.com"
                className="flex items-center gap-2 text-sm font-medium text-[#0C1E21] sm:text-[15px]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1D8B8A] text-white sm:h-9 sm:w-9">
                  <Mail size={14} />
                </span>
                info@bexon.com
              </a>
            </div>

            {/* Social Icons */}
            <div className="flex gap-3">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  aria-label={social.name}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/10 text-[#0C1E21]/60 transition-colors duration-300 hover:bg-[#1D8B8A] hover:text-white sm:h-10 sm:w-10"
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-center text-sm text-[#0C1E21]/60 sm:text-[15px]">
              © 2026 <span className="font-semibold text-[#0C1E21]">Bexon</span>{" "}
              All right reserved
            </p>
          </div>
        </div>

        {/* Scroll to top button */}
        <ScrollProgressButton />
      </div>
    </section>
  );
}
