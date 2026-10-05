import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export default function Contact() {
  return (
    <section className="w-full px-4">
      <div className="xs:h-[260px] max-w-8xl relative flex h-55 w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 shadow-2xl sm:h-82.5 md:h-100 lg:h-95">
        <Image
          src="https://themejunction.net/html/bexon/demo/assets/images/bg/pheader-bg.webp"
          fill
          alt="Page Header Background"
          className="object-cover object-center"
          priority
          sizes="(max-width: 1280px) 100vw, 1280px"
        />

        <Image
          src="https://themejunction.net/html/bexon/demo/assets/images/shape/pheader-overlay.webp"
          fill
          alt="Header Overlay Shape"
          className="pointer-events-none object-cover object-center opacity-80"
          priority
          sizes="(max-width: 1280px) 100vw, 1280px"
        />

        <div
          data-wow-duration="1.2s"
          data-wow-delay="0.15s"
          data-wow-offset="80"
          className="wow animate__animated animate__fadeIn pointer-events-none absolute h-40 w-40 rounded-full bg-[#1D8B8A]/30 blur-3xl sm:h-60 sm:w-60"
        />

        <div className="relative z-10 flex flex-col items-center justify-center px-4 text-center">
          <h1
            data-wow-duration="0.9s"
            data-wow-delay="0.15s"
            data-wow-offset="80"
            className="wow animate__animated animate__fadeInDown xs:text-3xl mb-3 text-2xl font-bold tracking-tight text-white sm:mb-4 sm:text-4xl md:text-5xl lg:text-6xl"
          >
            Contact Us
          </h1>

          <div
            data-wow-duration="0.9s"
            data-wow-delay="0.3s"
            data-wow-offset="80"
            className="wow animate__animated animate__fadeInUp inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3.5 py-1.5 backdrop-blur-md transition-all duration-300 hover:border-white/25 hover:bg-black/40 sm:px-5 sm:py-2"
          >
            <Home size={15} className="text-[#1D8B8A] sm:size-4.25" />

            <Link
              href="/"
              className="text-xs font-medium text-gray-200 transition-colors duration-300 hover:text-[#1D8B8A] sm:text-sm"
            >
              Home
            </Link>

            <ChevronRight size={14} className="text-gray-400 sm:size-4" />

            <span className="text-xs font-semibold text-[#1D8B8A] sm:text-sm">
              About Us
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
