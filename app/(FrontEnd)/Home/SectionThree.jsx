"use client";

import { useEffect, useState } from "react";
import Loader from "@/app/Components/Loader";

export default function BrandLogos() {
  const logos = [
    "https://themejunction.net/html/bexon/demo/assets/images/brands/brand-1.webp",
    "https://themejunction.net/html/bexon/demo/assets/images/brands/brand-2.webp",
    "https://themejunction.net/html/bexon/demo/assets/images/brands/brand-3.webp",
    "https://themejunction.net/html/bexon/demo/assets/images/brands/brand-4.webp",
    "https://themejunction.net/html/bexon/demo/assets/images/brands/brand-5.webp",
    "https://themejunction.net/html/bexon/demo/assets/images/brands/brand-6.webp",
  ];

  const [dbLogos, setDbLogos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dataLogos = async () => {
      try {
        const res = await fetch("/api/homepage/brand-logos/postlogoDB");
        const data = await res.json();

        console.log("API DATA:", data);

        const uploadedLogos =
          data?.data?.flatMap(
            (item) => item?.logos?.map((logo) => logo.url) || [],
          ) || [];

        console.log("DB LOGOS:", uploadedLogos);

        setDbLogos([...logos, ...uploadedLogos]);
      } catch (error) {
        console.error("Failed to load brand logos:", error);
        setDbLogos(logos);
      } finally {
        setLoading(false);
      }
    };

    dataLogos();
  }, []);

  if (loading) {
    return (
      <section className="relative h-100 w-[96vw] overflow-hidden bg-[#eef2f2] py-20">
        <Loader />
      </section>
    );
  }

  return (
    <section className="relative h-100 w-[96vw] overflow-hidden bg-[#eef2f2] py-20">
      <div className="relative z-0 mx-auto flex max-w-7xl flex-col items-center px-4">
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

        <div
          className="wow animate__animated animate__fadeInUp mt-14 w-full overflow-hidden"
          data-wow-duration="1s"
          data-wow-delay="0.3s"
        >
          <div
            className="flex w-max"
            style={{
              animation: "logoScroll 20s linear infinite",
            }}
          >
            <div className="flex shrink-0 gap-6 pr-6">
              {dbLogos.map((logo, index) => (
                <div
                  key={`first-${index}`}
                  className="wow animate__animated animate__fadeIn flex h-28 w-48 shrink-0 items-center justify-center rounded-xl bg-white px-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  data-wow-duration="0.7s"
                  data-wow-delay={`${0.1 + (index % 6) * 0.1}s`}
                >
                  <img
                    src={logo}
                    alt={`Company logo ${index + 1}`}
                    className="h-auto w-full max-w-35 object-contain opacity-60 transition-all duration-300 hover:opacity-100"
                  />
                </div>
              ))}
            </div>

            <div className="flex shrink-0 gap-6 pr-6">
              {dbLogos.map((logo, index) => (
                <div
                  key={`second-${index}`}
                  className="wow animate__animated animate__fadeIn flex h-28 w-48 shrink-0 items-center justify-center rounded-xl bg-white px-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  data-wow-duration="0.7s"
                  data-wow-delay={`${0.1 + (index % 6) * 0.1}s`}
                >
                  <img
                    src={logo}
                    alt={`Company logo ${index + 1}`}
                    className="h-auto w-full max-w-35 object-contain opacity-60 transition-all duration-300 hover:opacity-100"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes logoScroll {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
