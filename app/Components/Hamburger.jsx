"use client";

import Image from "next/image";
import { useState } from "react";
import { X } from "lucide-react";

import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";

export default function Hamburger() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const openMenu = () => {
    setIsMenuOpen(true);
    document.body.classList.add("overflow-hidden");
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.classList.remove("overflow-hidden");
  };

  return (
    <div className="relative">
      {/* Hamburger Button */}
      {!isMenuOpen && (
        <button
          type="button"
          onClick={openMenu}
          className="group relative z-60 flex cursor-pointer flex-col space-y-1.5 rounded-md bg-[#1E8A8A] p-3 text-white lg:bg-white lg:p-0"
        >
          <span className="h-0.5 w-8 bg-gray-100 transition-all duration-300 lg:bg-black lg:group-hover:bg-[#1E8A8A]"></span>

          <span className="h-0.5 w-6 bg-gray-100 transition-all duration-300 group-hover:w-8 lg:bg-black lg:group-hover:bg-[#1E8A8A]"></span>

          <span className="h-0.5 w-8 bg-gray-100 transition-all duration-300 lg:bg-black lg:group-hover:bg-[#1E8A8A]"></span>
        </button>
      )}

      {/* Blur Background */}
      {isMenuOpen && (
        <div onClick={closeMenu} className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm"></div>
      )}

      {/* Hamburger Menu */}
      {isMenuOpen && (
        <div className="scrollbar-cyan fixed right-5 top-5 z-50 max-h-[calc(100vh-40px)] w-[480px] max-w-[calc(100vw-30px)] overflow-y-auto rounded-xl bg-[#0C2426] text-white shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 z-10 flex h-24 items-center justify-between border-b border-white/10 bg-[#0C2426] px-7">
            {/* Logo */}
            <Image
              src="https://themejunction.net/html/bexon/demo/assets/images/logos/logo-2.webp"
              alt="Bexon Logo"
              width={150}
              height={60}
              className="w-32"
            />

            {/* Close Button */}
            <button
              type="button"
              onClick={closeMenu}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 transition-all duration-300 hover:rotate-90 hover:bg-[#1E8A8A]"
            >
              <X size={22} />
            </button>
          </div>

          {/* Content */}
          <div className="p-7">
            {/* Description */}
            <div className="mb-8">
              <p className="text-[16px] leading-7 text-gray-400">
                Developing personalize our customer journeys to increase satisfaction & loyalty of
                our expansion recognized by industry leaders.
              </p>
            </div>

            {/* Search */}
            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold text-white">Search Now!</h2>

              <div className="flex h-12 overflow-hidden rounded-lg bg-white">
                <input
                  type="text"
                  placeholder="Search here..."
                  className="w-full px-4 text-sm text-[#0C1E21] outline-none placeholder:text-gray-500"
                />

                <button
                  type="button"
                  className="flex w-14 shrink-0 items-center justify-center bg-[#1E8A8A] text-white transition-colors duration-300 hover:bg-[#167272]"
                >
                  <Image
                    src="/icons/magnifiying-glass.png"
                    alt="Search"
                    width={20}
                    height={20}
                    className="h-5 w-5 brightness-0 invert"
                  />
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mb-8">
              <h2 className="mb-5 text-2xl font-semibold text-white">Contact Info</h2>

              <div className="space-y-5">
                {/* Phone */}
                <div>
                  <p className="mb-1 text-sm text-gray-400">Phone</p>

                  <a
                    href="tel:10095447818"
                    className="text-base text-white transition-colors duration-300 hover:text-[#1E8A8A]"
                  >
                    +1 (009) 544-7818
                  </a>
                </div>

                {/* Email */}
                <div>
                  <p className="mb-1 text-sm text-gray-400">Email</p>

                  <a
                    href="mailto:info@bexon.com"
                    className="text-base text-white transition-colors duration-300 hover:text-[#1E8A8A]"
                  >
                    info@bexon.com
                  </a>
                </div>

                {/* Location */}
                <div>
                  <p className="mb-1 text-sm text-gray-400">Location</p>

                  <p className="text-base leading-6 text-white">
                    993 Renner Burg, West Rond, MT 94251-030
                  </p>
                </div>
              </div>
            </div>

            {/* Follow Us */}
            <div className="pb-3">
              <h2 className="mb-4 text-2xl font-semibold text-white">Follow Us</h2>

              <div className="flex gap-3">
                {/* Facebook */}
                <a
                  href="#"
                  aria-label="Facebook"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 hover:bg-[#1E8A8A]"
                >
                  <FaFacebookF size={15} />
                </a>

                {/* X */}
                <a
                  href="#"
                  aria-label="X"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 hover:bg-[#1E8A8A]"
                >
                  <FaXTwitter size={15} />
                </a>

                {/* LinkedIn */}
                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 hover:bg-[#1E8A8A]"
                >
                  <FaLinkedinIn size={16} />
                </a>

                {/* Instagram */}
                <a
                  href="#"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 hover:bg-[#1E8A8A]"
                >
                  <FaInstagram size={17} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
