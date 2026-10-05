import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function SectionTwelve() {
  return (
    <section className="relative z-20 flex w-full items-center justify-center px-4 py-12 md:px-6 md:py-20 lg:px-12">
      <div className="mx-auto flex h-199 w-full max-w-7xl flex-col items-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a4d4d] to-[#0d3333] shadow-2xl shadow-black/60 sm:flex-col lg:h-70 lg:flex-row">
        {/* Left Content Section */}
        <div className="flex w-full flex-col justify-center px-8 py-16 lg:w-1/2 lg:px-16 lg:py-24">
          <h1
            className="wow animate__animated animate__fadeInUp mb-6 text-4xl leading-[1.1] font-bold tracking-tight text-white sm:text-5xl lg:text-5xl"
            data-wow-duration="0.9s"
            data-wow-delay="0.1s"
          >
            Let&apos;s Build Future
            <br />
            Together.
          </h1>

          {/* Button */}
          <button
            type="button"
            className="wow animate__animated animate__fadeInUp group/button flex h-14 w-full max-w-55 cursor-pointer items-center justify-between overflow-hidden rounded-full bg-black py-1.5 pr-1.5 pl-6 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/25 sm:h-[58px] sm:text-base"
            data-wow-duration="0.9s"
            data-wow-delay="0.35s"
          >
            <span className="overflow-hidden leading-none">
              <span className="block text-white transition-transform duration-400 [text-shadow:0_30px_0_currentColor] group-hover/button:-translate-y-7.5">
                Get Started Now
              </span>
            </span>

            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ffff] transition-all duration-300 sm:h-12.5 sm:w-12.5">
              <ArrowRight
                size={18}
                className="-rotate-45 text-black transition-transform duration-300 group-hover/button:rotate-0 sm:size-5"
                strokeWidth={2.5}
              />
            </span>
          </button>
        </div>

        {/* Right Image Section */}
        <div
          className="wow animate__animated animate__fadeInRight relative flex w-full justify-end lg:w-1/2"
          data-wow-duration="1s"
          data-wow-delay="0.25s"
        >
          <div className="relative h-80 w-full items-end sm:h-96 lg:h-[279.5px] lg:w-full">
            <Image
              src="https://themejunction.net/html/bexon/demo/assets/images/cta/cta-bg.webp"
              fill
              alt="Future collaboration illustration"
              className="object-cover lg:rounded-r-2xl"
              priority
            />
            {/* Gradient overlay for seamless blend */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d3333]/80 via-[#0d3333]/20 to-transparent lg:rounded-r-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
