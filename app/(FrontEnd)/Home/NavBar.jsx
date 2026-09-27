"use client";

import Image from "next/image";

import { ArrowRight, ChevronDown } from "lucide-react";

import Hamburger from "@/app/Components/Hamburger";

// import HomeDropDown from "@/app/Components/HomeDropDown";

import BlogDropDown from "@/app/Components/BlogDropDown";

import PageDropDown from "@/app/Components/PageDropDown";

export const NavBar = () => {
  return (
    <>
      <nav className="relative w-full">
        <div className="relative mx-4 flex h-25 items-center  rounded-b-xl bg-white">
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
                  <div className="flex cursor-pointer items-center gap-2 text-md font-medium text-[#0C1E21] transition-colors duration-300 group-hover:text-[#1E8A8A]">
                    Home
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
                  <div className="flex cursor-pointer items-center gap-2 text-md font-medium text-[#0C1E21] transition-colors duration-300 group-hover:text-[#1E8A8A]">
                    Pages
                    <ChevronDown
                      size={18}
                      className="transition-transform duration-300 group-hover:rotate-180"
                    />
                  </div>

                  {/* Pages Dropdown */}
                  {/* <PageDropDown /> */}
                </li>

                {/* Services */}
                <li className="group flex cursor-pointer items-center gap-2 text-md font-medium text-[#0C1E21] transition-colors duration-300 hover:text-[#1E8A8A]">
                  Services
                  <ChevronDown
                    size={18}
                    className="transition-transform duration-300 group-hover:rotate-180"
                  />
                </li>

                {/* Portfolio */}
                <li className="group relative cursor-pointer">
                  <div className="flex items-center gap-2 text-md font-medium text-[#0C1E21] transition-colors duration-300 group-hover:text-[#1E8A8A]">
                    Portfolio
                    <ChevronDown
                      size={18}
                      className="transition-transform duration-300 group-hover:rotate-180"
                    />
                  </div>

                  {/* Portfolio Dropdown */}
                  <div className="invisible absolute left-0 top-full z-50 mt-9 h-22 w-52 translate-y-2 rounded-lg bg-[#FFFFFF] p-4 font-semibold text-[#0C1E21] opacity-0 shadow-lg shadow-gray-400 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
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
                  <div className="flex items-center gap-2 text-md font-medium text-[#0C1E21] transition-colors duration-300 group-hover:text-[#1E8A8A]">
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
                <li className="group flex cursor-pointer items-center gap-2 text-md font-medium text-[#0C1E21] transition-colors duration-300 hover:text-[#1E8A8A]">
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
                <div className="invisible absolute right-0 top-14 z-50 w-96 translate-y-2 rounded-md border bg-white p-5 opacity-0 shadow-lg shadow-gray-400 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="h-11 w-full rounded-full border border-gray-300 px-5 text-sm text-gray-700 outline-none transition-all duration-300 focus:border-[#1E8A8A]"
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

              {/* Let's Talk */}
              <button className="group hidden cursor-pointer items-center gap-2 rounded-full bg-[#1E8A8A] px-4 py-2 text-md font-semibold text-white lg:flex lg:block">
                Let&apos;s Talk
                <div className="flex h-3 w-3 items-center justify-center rounded-full bg-black sm:h-9 sm:w-9">
                  <ArrowRight
                    size={20}
                    className="w-10 rotate-320 transition-transform duration-300 group-hover:rotate-360"
                  />
                </div>
              </button>

              {/* Hamburger */}
              <Hamburger />
            </div>
          </main>
        </div>
      </nav>
    </>
  );
};
