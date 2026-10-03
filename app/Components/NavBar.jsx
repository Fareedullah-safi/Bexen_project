"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";

import Hamburger from "@/app/Components/Hamburger";
// import HomeDropDown from "@/app/Components/HomeDropDown";
import BlogDropDown from "@/app/Components/BlogDropDown";
import PageDropDown from "@/app/Components/PageDropDown";
import Link from "next/link";

export const NavBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      // Check if user scrolled past 50px
      if (currentScrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Hide navbar when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 120) {
        // Scrolling DOWN
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling UP
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", controlNavbar, { passive: true });

    return () => {
      window.removeEventListener("scroll", controlNavbar);
    };
  }, [lastScrollY]);

  return (
    <nav
      className={`z-50 w-full transition-transform duration-300 ${
        isScrolled ? "fixed top-0 right-0 left-0" : "relative"
      } ${isScrolled && !isVisible ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div className="relative mx-4 flex h-25 items-center rounded-b-xl bg-white">
        <main className="flex h-15 w-full items-center justify-between px-5">
          {/* Logo */}
          <div>
            <Image
              src="https://themejunction.net/html/bexon/demo/assets/images/logos/logo.webp"
              alt="Bexon Logo"
              width={200}
              height={100}
              className="w-30 lg:w-28 xl:w-30"
            />
          </div>

          {/* Navigation */}
          <div className="hidden h-full lg:block">
            <ul className="flex h-full items-center gap-6">
              {/* Home */}
              <li className="group relative">
                <div className="text-md flex cursor-pointer items-center gap-2 font-medium text-[#0C1E21] transition-colors duration-300 group-hover:text-[#1E8A8A]">
                  <Link href="/">Home</Link>
                  <ChevronDown
                    size={18}
                    className="transition-transform duration-300 group-hover:rotate-180"
                  />
                </div>

                {/* Home Dropdown */}
                {/* <HomeDropDown /> */}
              </li>

              {/* Pages */}
              <li className="group relative">
                <div className="text-md flex cursor-pointer items-center gap-2 font-medium text-[#0C1E21] transition-colors duration-300 group-hover:text-[#1E8A8A]">
                  <Link href="/about">About</Link>
                  <ChevronDown
                    size={18}
                    className="transition-transform duration-300 group-hover:rotate-180"
                  />
                </div>

                {/* Pages Dropdown */}
                {/* <PageDropDown /> */}
              </li>

              {/* Services */}
              <li className="group text-md flex cursor-pointer items-center gap-2 font-medium text-[#0C1E21] transition-colors duration-300 hover:text-[#1E8A8A]">
                <Link href="/services">Service Details</Link>
                <ChevronDown
                  size={18}
                  className="transition-transform duration-300 group-hover:rotate-180"
                />
              </li>

              {/* Portfolio */}
              <li className="group relative cursor-pointer">
                <div className="text-md flex items-center gap-2 font-medium text-[#0C1E21] transition-colors duration-300 group-hover:text-[#1E8A8A]">
                  Portfolio
                  <ChevronDown
                    size={18}
                    className="transition-transform duration-300 group-hover:rotate-180"
                  />
                </div>

                {/* Portfolio Dropdown */}
                <div className="invisible absolute top-full left-0 z-50 mt-9 h-22 w-52 translate-y-2 rounded-lg bg-[#FFFFFF] p-4 font-semibold text-[#0C1E21] opacity-0 shadow-lg shadow-gray-400 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="flex flex-col gap-3">
                    <h1 className="cursor-pointer text-[15px] tracking-[0.2px] text-[#596366] transition-all duration-300 hover:translate-x-1 hover:text-[#1E8A8A]">
                      Portfolio
                    </h1>

                    <h1 className="cursor-pointer text-[15px] tracking-[0.2px] text-[#596366] transition-all duration-300 hover:translate-x-1 hover:text-[#1E8A8A]">
                      Portfolio Details
                    </h1>
                  </div>
                </div>
              </li>

              {/* Blog */}
              <li className="group relative cursor-pointer">
                <div className="text-md flex items-center gap-2 font-medium text-[#0C1E21] transition-colors duration-300 group-hover:text-[#1E8A8A]">
                  Blog
                  <ChevronDown
                    size={18}
                    className="text-[#0C1E21] transition-all duration-300 group-hover:rotate-180 group-hover:text-[#1E8A8A]"
                  />
                </div>

                {/* Blog Drop down */}
                <BlogDropDown />
              </li>

              {/* Contact */}
              <li className="group text-md flex cursor-pointer items-center gap-2 font-medium text-[#0C1E21] transition-colors duration-300 hover:text-[#1E8A8A]">
                Contact
              </li>
            </ul>
          </div>

          {/* Search + Button */}
          <div className="relative flex items-center gap-4">
            <div className="group relative flex items-center gap-4">
              {/* Search */}
              <div className="hidden h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-200 transition-all duration-300 hover:scale-110 hover:bg-gray-300 lg:flex">
                <Image
                  src="/icons/magnifiying-glass.png"
                  alt="Search"
                  width={24}
                  height={24}
                  className="h-4 w-4 sm:h-5 sm:w-5"
                />
              </div>

              {/* Search box Drop Down */}
              <div className="invisible absolute top-14 right-0 z-50 w-96 translate-y-2 rounded-md border bg-white p-5 opacity-0 shadow-lg shadow-gray-400 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="h-11 w-full rounded-full border border-gray-300 px-5 text-sm text-gray-700 transition-all duration-300 outline-none focus:border-[#1E8A8A]"
                  />

                  <button className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1E8A8A] text-white transition-all duration-300 hover:scale-105 hover:bg-[#167272]">
                    <Image
                      src="/icons/magnifiying-glass.png"
                      alt="Search"
                      width={20}
                      height={20}
                      className="h-4 w-4 brightness-0 invert"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Let's Talk Button */}
            <button
              type="submit"
              className="group/button hidden h-11 w-fit min-w-[150px] cursor-pointer items-center justify-between gap-1.5 overflow-hidden rounded-full bg-[#1E8A8A] py-1 pr-1 pl-5 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#167575] hover:shadow-xl hover:shadow-[#1E8A8A]/20 sm:h-12 sm:text-sm lg:flex"
            >
              <span className="overflow-hidden leading-none">
                <span className="block transition-transform duration-400 [text-shadow:0_30px_0_currentColor] group-hover/button:-translate-y-7.5">
                  Let&apos;s Talk
                </span>
              </span>

              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0C1E21] sm:h-10 sm:w-10">
                <ArrowRight
                  size={16}
                  className="-rotate-45 transition-transform duration-300 group-hover/button:rotate-0 sm:size-[18px]"
                />
              </span>
            </button>

            {/* Hamburger */}
            <Hamburger />
          </div>
        </main>
      </div>
    </nav>
  );
};
