"use client";

import { ArrowLeft, ArrowRight, GlobeIcon, Quote } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function SectionEight() {
  const testimonials = [
    {
      id: 1,
      name: "Guy Hawkins",
      role: "Co. Founder",
      image:
        "https://themejunction.net/html/bexon/demo/assets/images/testimonial/client-1.webp",
      comment:
        "Working with Bexon has been a game-changer for our business. Their team's professionalism, attention to detail, and innovative solutions have helped us streamline operations and achieve our goals faster than we imagined.",
    },
    {
      id: 2,
      name: "Ralph Edwards",
      role: "Co. Founder",
      image:
        "https://themejunction.net/html/bexon/demo/assets/images/testimonial/client-2.webp",
      comment:
        "The results we've seen after partnering with Bexon are beyond our expectations. They understood our vision and brought new ideas to the table that took our business to the next level.",
    },
    {
      id: 3,
      name: "Devon Lane",
      role: "Co. Founder",
      image:
        "https://themejunction.net/html/bexon/demo/assets/images/testimonial/client-3.webp",
      comment:
        "We've been working with Bexon for years, and they continue to deliver outstanding results. Their team is proactive, responsive, and always goes the extra mile.",
    },
    {
      id: 4,
      name: "Esther Howard",
      role: "Co. Founder",
      image:
        "https://themejunction.net/html/bexon/demo/assets/images/testimonial/client-1.webp",
      comment:
        "We believe in building lasting relationships with our clients through trust, innovation, and exceptional service.",
    },
    {
      id: 5,
      name: "Kathryn Murphy",
      role: "Business Manager",
      image:
        "https://themejunction.net/html/bexon/demo/assets/images/testimonial/client-2.webp",
      comment:
        "The attention to detail and dedication of the team made the entire experience smooth, professional, and genuinely enjoyable.",
    },
    {
      id: 6,
      name: "Wade Warren",
      role: "Product Director",
      image:
        "https://themejunction.net/html/bexon/demo/assets/images/testimonial/client-3.webp",
      comment:
        "Their creative approach and consistent support helped us turn our ideas into a stronger digital experience for our customers.",
    },
  ];

  const slideSets = [
    [0, 1, 2],
    [1, 2, 3],
    [2, 3, 4],
    [3, 4, 5],
    [3, 4, 0],
    [4, 0, 1],
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slideSets.length);
  };

  const previousSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slideSets.length) % slideSets.length);
  };

  const visibleTestimonials = slideSets[currentSlide].map(
    (index) => testimonials[index],
  );

  return (
    <section className="relative z-10 -mt-50 w-full bg-[#e8eeee] px-4">
      <div className="relative min-h-screen overflow-hidden rounded-3xl bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(#bfdbfe_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-16 pt-50 sm:px-10 lg:px-16">
          {/* Heading */}
          <div>
            <span
              data-wow-duration="0.8s"
              className="wow animate__animated animate__fadeInDown group inline-flex items-center gap-2 border border-cyan-100 bg-[#eef2f2] px-4 py-2 text-sm font-bold tracking-wide text-[#1E8A8A] shadow-sm"
            >
              <GlobeIcon
                size={17}
                className="transition-transform duration-500 group-hover:rotate-180"
              />
              CLIENTS FEEDBACK
            </span>

            <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <h1
                data-wow-duration="0.9s"
                data-wow-delay="0.1s"
                className="wow animate__animated animate__fadeInLeft max-w-3xl text-4xl leading-tight font-medium text-[#102326] sm:text-5xl lg:text-5xl"
              >
                Success <span className="text-[#1E8A8A]">Stories</span> Fuel
                <br />
                our
                <span className="text-[#1E8A8A]"> Innovation.</span>
              </h1>

              {/* Navigation */}
              <div
                data-wow-duration="0.8s"
                data-wow-delay="0.2s"
                className="wow animate__animated animate__fadeInRight flex shrink-0 items-center gap-3"
              >
                <button
                  type="button"
                  aria-label="Previous testimonials"
                  onClick={previousSlide}
                  className="group flex h-13 w-13 cursor-pointer items-center justify-center rounded-full border border-[#102326]/10 bg-[#eef2f2] text-[#102326] transition-all duration-300 hover:border-[#1E8A8A] hover:bg-[#1E8A8A] hover:text-white hover:shadow-lg hover:shadow-[#1E8A8A]/20"
                >
                  <ArrowLeft
                    size={20}
                    className="transition-transform duration-300 group-hover:-translate-x-1"
                  />
                </button>

                <button
                  type="button"
                  aria-label="Next testimonials"
                  onClick={nextSlide}
                  className="group flex h-13 w-13 cursor-pointer items-center justify-center rounded-full bg-[#1E8A8A] text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#167575] hover:shadow-lg hover:shadow-[#1E8A8A]/20"
                >
                  <ArrowRight
                    size={20}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
              </div>
            </div>

            <div
              data-wow-duration="0.8s"
              data-wow-delay="0.3s"
              className="wow animate__animated animate__fadeIn mt-10 h-px w-full bg-[#102326]/10"
            />
          </div>

          {/* Testimonials */}
          <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {visibleTestimonials.map((testimonial, index) => (
              <div
                key={`${testimonial.id}-${currentSlide}`}
                data-wow-duration="0.8s"
                data-wow-delay={`${0.1 + index * 0.12}s`}
                className="wow animate__animated animate__fadeInUp group relative flex min-h-80 flex-col justify-between overflow-hidden rounded-3xl border border-[#102326]/8 bg-white/80 p-6 shadow-[0_10px_40px_rgba(16,35,38,0.06)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-[#1E8A8A]/20 hover:shadow-[0_20px_50px_rgba(16,35,38,0.1)] sm:p-7"
              >
                {/* Top Accent */}
                <div className="absolute top-0 left-0 h-1 w-0 bg-[#1E8A8A] transition-all duration-500 group-hover:w-full" />

                {/* Soft Glow */}
                <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-[#1E8A8A]/5 blur-2xl transition-all duration-500 group-hover:bg-[#1E8A8A]/10" />

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef2f2]">
                      <Quote
                        size={22}
                        className="text-[#1E8A8A] transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>

                    <div className="rounded-full bg-[#eef2f2] px-3 py-1 text-xs tracking-widest text-[#1E8A8A]">
                      ★★★★★
                    </div>
                  </div>

                  <p className="mt-7 text-sm leading-7 text-zinc-600 sm:text-base">
                    {testimonial.comment}
                  </p>
                </div>

                {/* User */}
                <div className="relative z-10 mt-8 flex items-center gap-4 border-t border-[#102326]/8 pt-5">
                  <div className="relative">
                    <Image
                      width={900}
                      height={999}
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="h-12 w-12 rounded-full object-cover ring-4 ring-[#eef2f2] transition-transform duration-500 group-hover:scale-105"
                    />

                    <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-[#1E8A8A]" />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-[#102326] sm:text-base">
                      {testimonial.name}
                    </h2>

                    <p className="mt-1 text-xs text-zinc-500">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Slider Indicators */}
          <div
            data-wow-duration="0.8s"
            data-wow-delay="0.5s"
            className="wow animate__animated animate__fadeIn mt-8 flex justify-center gap-2"
          >
            {slideSets.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to testimonial slide ${index + 1}`}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index
                    ? "w-8 bg-[#1E8A8A]"
                    : "w-2 bg-[#1E8A8A]/20"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
