"use client";

import Image from "next/image";
import { useEffect } from "react";

export default function SectionThree() {
  // Company logos
  const logos = [
    "https://themejunction.net/html/bexon/demo/assets/images/brands/brand-1.webp",
    "https://themejunction.net/html/bexon/demo/assets/images/brands/brand-2.webp",
    "https://themejunction.net/html/bexon/demo/assets/images/brands/brand-3.webp",
    "https://themejunction.net/html/bexon/demo/assets/images/brands/brand-4.webp",
    "https://themejunction.net/html/bexon/demo/assets/images/brands/brand-5.webp",
    "https://themejunction.net/html/bexon/demo/assets/images/brands/brand-6.webp",
  ];

  useEffect(() => {
    const dataLogos = async () => {
      const res = await fetch("/api/homepage/brand-logos/postlogoDB");
      const logos = await res.json();
      console.log(logos);
    };
    dataLogos();
  }, []);

  return (
    <section className="relative h-100 w-[96vw] overflow-hidden bg-[#eef2f2] py-20">
      {/* Main section container */}
      <div className="relative z-0 mx-auto flex max-w-7xl flex-col items-center px-4">
        {/* Center circle */}
        <div
          className="wow animate__animated animate__zoomIn pointer-events-none absolute top-1/2 left-1/2 z-9 mt-6 flex h-50 w-50 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-dashed border-gray-300 bg-white/30 leading-loose backdrop-blur-md lg:h-80 lg:w-80"
          data-wow-duration="1s"
        >
          <h2
            className="wow animate__animated animate__fadeInUp max-w-80 text-center text-lg leading-7 font-semibold text-[#102124] lg:text-xl"
            data-wow-duration="0.8s"
            data-wow-delay="0.4s"
          >
            Join Over{" "}
            <span className="rounded-full bg-[#1E8A8A] px-2 py-1 text-white">
              1000+
              <br />
            </span>{" "}
            Companies with
            <br />
            <span className="text-gray-500 underline">Bexon</span> Here
          </h2>
        </div>

        {/* Logo slider wrapper */}
        <div
          className="wow animate__animated animate__fadeInUp mt-14 w-full overflow-hidden"
          data-wow-duration="1s"
          data-wow-delay="0.3s"
        >
          <div className="flex w-max animate-[logoScroll_20s_linear_infinite]">
            {/* First set of logos */}
            <div className="flex shrink-0 gap-6 pr-6">
              {logos.map((logo, index) => (
                <div
                  key={index}
                  className="wow animate__animated animate__fadeIn flex h-28 w-48 shrink-0 items-center justify-center rounded-xl bg-white px-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  data-wow-duration="0.7s"
                  data-wow-delay={`${0.1 + index * 0.1}s`}
                >
                  {/* Company logo */}
                  <Image
                    src={logo}
                    alt={`Company logo ${index + 1}`}
                    width={180}
                    height={80}
                    className="h-auto w-full max-w-35 object-contain opacity-60 transition-all duration-300 hover:opacity-100"
                  />
                </div>
              ))}
            </div>

            {/* Second set of logos */}
            <div className="flex shrink-0 gap-6 pr-6">
              {logos.map((logo, index) => (
                <div
                  key={index}
                  className="wow animate__animated animate__fadeIn flex h-28 w-48 shrink-0 items-center justify-center rounded-xl bg-white px-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  data-wow-duration="0.7s"
                  data-wow-delay={`${0.1 + index * 0.1}s`}
                >
                  {/* Company logo */}
                  <Image
                    src={logo}
                    alt={`Company logo ${index + 1}`}
                    width={180}
                    height={80}
                    className="h-auto w-full max-w-35 object-contain opacity-60 transition-all duration-300 hover:opacity-100"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
