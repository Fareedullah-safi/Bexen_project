import { Box, ArrowRight, CheckCircle } from "lucide-react";
import Image from "next/image";
import ProgressBox from "./ProgressBox"; // ← ADD THIS

export default function SectionTwo() {
  return (
    <section className="relative w-full px-3 py-3 sm:px-4 sm:py-4">
      <div className="relative overflow-hidden rounded-2xl bg-[#dce8e8] sm:rounded-3xl">
        {/* Diagonal stripe pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, #000 0, #000 1px, transparent 1px, transparent 12px)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:gap-10 sm:px-8 sm:py-16 md:px-12 lg:flex-row lg:items-stretch lg:gap-10 lg:py-24">
          {/* Left - Image */}
          <div className="relative w-full shrink-0 lg:w-1/2">
            <Image
              alt="Team at work"
              width={999}
              height={999}
              sizes="(max-width: 1024px) 100vw, 50vw"
              src="https://themejunction.net/html/bexon/demo/assets/images/about/about-5.webp"
              className="h-[280px] w-full rounded-2xl object-cover sm:h-[400px] md:h-[480px] lg:h-full lg:min-h-[500px]"
            />
            <ProgressBox /> {/* ← REPLACE the old static div with this */}
          </div>

          {/* Right - Content */}
          <div className="flex w-full min-w-0 flex-col gap-5 sm:gap-6 lg:w-1/2">
            {/* Badge */}
            <span className="group inline-flex w-fit items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50/30 px-3 py-1.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:bg-cyan-100 hover:shadow-md sm:px-4">
              <Box
                size={18}
                className="shrink-0 text-[#1E8A8A] transition-transform duration-300 group-hover:rotate-180"
              />
              <span className="text-xs font-bold tracking-wide text-zinc-950 sm:text-sm md:text-base">
                CHOOSE THE BEST
              </span>
            </span>

            {/* Heading */}
            <h2 className="text-2xl leading-tight font-medium text-[#102326] sm:text-3xl md:text-4xl xl:text-5xl">
              Driving Innovation and Excellence for Sustainable Corporate
              Success <span className="text-[#1E8A8A]">Worldwide.</span>
            </h2>

            {/* Mission & Vision Boxes */}
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:p-6">
                <h3 className="text-lg font-bold text-[#0C1E21] sm:text-xl">
                  Our Mission
                </h3>
                <p className="text-sm leading-relaxed text-[#0C1E21]/70 sm:text-[15px]">
                  Our mission is to empower businesses through innovative best
                  solutions, exceptional service.
                </p>
                <ul className="flex flex-col gap-2">
                  <li className="flex items-center gap-2 text-sm text-[#0C1E21]/80 sm:text-[15px]">
                    <CheckCircle
                      size={17}
                      className="shrink-0 text-[#1D8B8A]"
                    />
                    Innovation & Excellence
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#0C1E21]/80 sm:text-[15px]">
                    <CheckCircle
                      size={17}
                      className="shrink-0 text-[#1D8B8A]"
                    />
                    Exceptional Customer
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#0C1E21]/80 sm:text-[15px]">
                    <CheckCircle
                      size={17}
                      className="shrink-0 text-[#1D8B8A]"
                    />
                    Business Growth
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:p-6">
                <h3 className="text-lg font-bold text-[#0C1E21] sm:text-xl">
                  Our Vision
                </h3>
                <p className="text-sm leading-relaxed text-[#0C1E21]/70 sm:text-[15px]">
                  Our vision is to become a global leader in providing
                  transformative business solutions.
                </p>
                <ul className="flex flex-col gap-2">
                  <li className="flex items-center gap-2 text-sm text-[#0C1E21]/80 sm:text-[15px]">
                    <CheckCircle
                      size={17}
                      className="shrink-0 text-[#1D8B8A]"
                    />
                    Global Leadership
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#0C1E21]/80 sm:text-[15px]">
                    <CheckCircle
                      size={17}
                      className="shrink-0 text-[#1D8B8A]"
                    />
                    Transformative Impact
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#0C1E21]/80 sm:text-[15px]">
                    <CheckCircle
                      size={17}
                      className="shrink-0 text-[#1D8B8A]"
                    />
                    Sustainable Success
                  </li>
                </ul>
              </div>
            </div>

            {/* Learn More Button */}
            <div className="w-full">
              <button
                type="button"
                className="group/button flex h-12 w-full cursor-pointer items-center justify-between overflow-hidden rounded-full bg-[#1D8B8A] py-1.5 pr-1.5 pl-5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#167575] hover:shadow-xl hover:shadow-[#1D8B8A]/30 sm:h-14 sm:pl-6 sm:text-base"
              >
                <span className="overflow-hidden leading-none">
                  <span className="block transition-transform duration-300 [text-shadow:0_30px_0_currentColor] group-hover/button:-translate-y-[30px]">
                    Learn More About Us
                  </span>
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0C1E21] sm:h-11 sm:w-11">
                  <ArrowRight
                    size={18}
                    className="-rotate-45 text-white transition-transform duration-300 group-hover/button:rotate-0"
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
