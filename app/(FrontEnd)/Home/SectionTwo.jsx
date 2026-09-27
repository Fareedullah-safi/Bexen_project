"use client";

import { GlobeIcon } from "lucide-react";
import { GiTrophyCup } from "react-icons/gi";
import { GoLightBulb } from "react-icons/go";
import { MdSupportAgent } from "react-icons/md";

export default function SectionTwoSectionTwo() {
  return (
    <section className="w-full">
      <main className="px-4 py-12 sm:px-6 lg:px-12">

        {/* Heading Badge */}
        <div className="flex justify-center">
          <span
            className="wow animate__animated animate__fadeInDown group flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50/70 px-4 py-2 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:bg-cyan-100 hover:shadow-md sm:px-5"
            data-wow-duration="0.8s"
          >
            <GlobeIcon
              size={18}
              className="text-[#1E8A8A] transition-transform duration-300 group-hover:rotate-180"
            />

            <h3 className="text-sm font-semibold tracking-wide text-zinc-600 sm:text-md">
              CHOOSE THE BEST
            </h3>
          </span>
        </div>

        {/* Main Heading */}
        <h1
          className="wow animate__animated animate__fadeInUp pt-6 pb-8 text-center text-4xl font-medium leading-tight text-gray-700 sm:text-5xl"
          data-wow-duration="1s"
          data-wow-delay="0.2s"
        >
          Empowering Business
          <br />
          with <span className="text-[#1E8A8A]">Expertise.</span>
        </h1>

        {/* Cards Container */}
        <div className="mx-auto grid w-full grid-cols-1 gap-6 md:grid-cols-1 lg:grid-cols-3">

          {/* Card One */}
          <div
            className="wow animate__animated animate__fadeInUp group w-full cursor-pointer rounded-2xl bg-white p-6 transition-all duration-500 hover:-translate-y-2 hover:bg-[#1E8A8A] hover:shadow-xl sm:p-8"
            data-wow-duration="0.9s"
            data-wow-delay="0.2s"
          >
            {/* Light Bulb Icon */}
            <GoLightBulb className="h-20 w-20 text-[#1E8A8A] transition-all duration-500 group-hover:text-white" />

            {/* Card Title */}
            <h2 className="mt-8 text-xl font-bold text-zinc-950 transition-colors duration-500 group-hover:text-white">
              Innovative Solutions
            </h2>

            {/* Card Description */}
            <p className="mt-4 leading-7 text-gray-500 transition-colors duration-500 group-hover:text-white/90">
              We stay ahead of the curve, leveraging cutting-edge technologies
              and strategies to keep you competitive in a marketplace.
            </p>
          </div>

          {/* Card Two */}
          <div
            className="wow animate__animated animate__fadeInUp group w-full cursor-pointer rounded-2xl bg-white p-6 transition-all duration-500 hover:-translate-y-2 hover:bg-[#1E8A8A] hover:shadow-xl sm:p-8"
            data-wow-duration="0.9s"
            data-wow-delay="0.4s"
          >
            {/* Trophy Icon */}
            <GiTrophyCup className="h-20 w-20 text-[#1E8A8A] transition-all duration-500 group-hover:text-white" />

            {/* Card Title */}
            <h2 className="mt-8 text-xl font-bold text-zinc-950 transition-colors duration-500 group-hover:text-white">
              Award-Winning Expertise
            </h2>

            {/* Card Description */}
            <p className="mt-4 leading-7 text-gray-500 transition-colors duration-500 group-hover:text-white/90">
              Recognized by industry leaders, our award-winning team has a
              proven record of delivering excellence across projects.
            </p>
          </div>

          {/* Card Three */}
          <div
            className="wow animate__animated animate__fadeInUp group cursor-pointer rounded-2xl bg-white p-6 transition-all duration-500 hover:-translate-y-2 hover:bg-[#1E8A8A] hover:shadow-xl sm:p-8"
            data-wow-duration="0.9s"
            data-wow-delay="0.6s"
          >
            {/* Support Icon */}
            <MdSupportAgent className="h-20 w-20 text-[#1E8A8A] transition-all duration-500 group-hover:text-white" />

            {/* Card Title */}
            <h2 className="mt-8 text-xl font-bold text-zinc-950 transition-colors duration-500 group-hover:text-white">
              Dedicated Support
            </h2>

            {/* Card Description */}
            <p className="mt-4 leading-7 text-gray-500 transition-colors duration-500 group-hover:text-white/90">
              Our team is always available to address your concerns, providing
              quick and effective solutions to keep your business moving.
            </p>
          </div>

        </div>
      </main>
    </section>
  );
}