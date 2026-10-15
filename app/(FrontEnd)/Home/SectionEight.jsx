"use client";

import { ArrowLeft, ArrowRight, GlobeIcon, Quote } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function SectionEight() {
  const [section, setSection] = useState({
    badgeText: "",
    highlightWord: "",
    headingLineOne: "",
    headingLineTwo: "",
    description: "",
  });

  const [testimonials, setTestimonials] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const response = await fetch("/api/homepage/reviews-section", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load testimonials");
        }

        const result = await response.json();

        if (result.success && result.data) {
          if (result.data.section) {
            setSection({
              badgeText: result.data.section.badgeText || "",
              highlightWord: result.data.section.highlightWord || "",
              headingLineOne: result.data.section.headingLineOne || "",
              headingLineTwo: result.data.section.headingLineTwo || "",
              description: result.data.section.description || "",
            });
          }

          if (Array.isArray(result.data.reviews)) {
            setTestimonials(
              result.data.reviews.filter(
                (testimonial) =>
                  testimonial &&
                  (testimonial.text || testimonial.comment || testimonial.name),
              ),
            );
          } else {
            setTestimonials([]);
          }
        }
      } catch (error) {
        console.error("Failed to load testimonials:", error);
        setTestimonials([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTestimonials();
  }, []);

  const slideSets = testimonials.map((_, index) => {
    const total = testimonials.length;

    return [index % total, (index + 1) % total, (index + 2) % total];
  });

  const nextSlide = () => {
    if (slideSets.length === 0) return;

    setCurrentSlide((previous) => (previous + 1) % slideSets.length);
  };

  const previousSlide = () => {
    if (slideSets.length === 0) return;

    setCurrentSlide(
      (previous) => (previous - 1 + slideSets.length) % slideSets.length,
    );
  };
  console.log("service data", testimonials);

  const visibleTestimonials =
    slideSets.length > 0
      ? slideSets[currentSlide].map((index) => testimonials[index])
      : [];

  const headingParts = section.headingLineOne
    ? section.headingLineOne.split(section.highlightWord || "\u0000")
    : [];

  return (
    <section className="relative z-10 -mt-50 w-full bg-[#e8eeee] px-4">
      <div className="relative min-h-screen overflow-hidden rounded-3xl bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(#bfdbfe_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-16 pt-50 sm:px-10 lg:px-16">
          {/* Heading */}
          {(section.badgeText ||
            section.headingLineOne ||
            section.headingLineTwo ||
            section.highlightWord ||
            section.description) && (
            <div>
              {section.badgeText && (
                <span
                  data-wow-duration="0.8s"
                  className="wow animate__animated animate__fadeInDown group inline-flex items-center gap-2 border border-cyan-100 bg-[#eef2f2] px-4 py-2 text-sm font-bold tracking-wide text-[#1E8A8A] shadow-sm"
                >
                  <GlobeIcon
                    size={17}
                    className="transition-transform duration-500 group-hover:rotate-180"
                  />
                  {section.badgeText}
                </span>
              )}

              <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                {(section.headingLineOne ||
                  section.headingLineTwo ||
                  section.highlightWord) && (
                  <h1
                    data-wow-duration="0.9s"
                    data-wow-delay="0.1s"
                    className="wow animate__animated animate__fadeInLeft max-w-3xl text-4xl leading-tight font-medium text-[#102326] sm:text-5xl lg:text-5xl"
                  >
                    {section.highlightWord && section.headingLineOne
                      ? headingParts[0]
                      : section.headingLineOne}

                    {section.highlightWord && section.headingLineOne && (
                      <span className="text-[#1E8A8A]">
                        {section.highlightWord}
                      </span>
                    )}

                    {section.highlightWord &&
                      section.headingLineOne &&
                      headingParts.slice(1).join(section.highlightWord)}

                    {section.headingLineOne && section.headingLineTwo && <br />}

                    {section.headingLineTwo && (
                      <span className="text-[#1E8A8A]">
                        {section.headingLineTwo}
                      </span>
                    )}
                  </h1>
                )}

                {section.description && (
                  <p className="max-w-xl text-sm leading-6 text-zinc-600 sm:text-base md:text-lg">
                    {section.description}
                  </p>
                )}

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
                    disabled={isLoading || testimonials.length === 0}
                    className="group flex h-13 w-13 cursor-pointer items-center justify-center rounded-full border border-[#102326]/10 bg-[#eef2f2] text-[#102326] transition-all duration-300 hover:border-[#1E8A8A] hover:bg-[#1E8A8A] hover:text-white hover:shadow-lg hover:shadow-[#1E8A8A]/20 disabled:cursor-not-allowed disabled:opacity-50"
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
                    disabled={isLoading || testimonials.length === 0}
                    className="group flex h-13 w-13 cursor-pointer items-center justify-center rounded-full bg-[#1E8A8A] text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#167575] hover:shadow-lg hover:shadow-[#1E8A8A]/20 disabled:cursor-not-allowed disabled:opacity-50"
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
          )}

          {/* Testimonials */}
          {isLoading ? (
            <div className="flex min-h-80 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1E8A8A]/20 border-t-[#1E8A8A]" />
            </div>
          ) : testimonials.length === 0 ? (
            <div className="py-16 text-center text-sm text-zinc-500">
              No testimonials available.
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
              {visibleTestimonials.map((testimonial, index) => (
                <div
                  key={testimonial._id || testimonial.id || index}
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

                    {(testimonial.text || testimonial.comment) && (
                      <p className="mt-7 text-sm leading-7 text-zinc-600 sm:text-base">
                        {testimonial.text || testimonial.comment}
                      </p>
                    )}
                  </div>

                  {/* User */}
                  <div className="relative z-10 mt-8 flex items-center gap-4 border-t border-[#102326]/8 pt-5">
                    <div className="relative h-12 w-12 shrink-0">
                      {testimonial.image ? (
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name || "Client"}
                          fill
                          sizes="48px"
                          className="rounded-full object-cover ring-4 ring-[#eef2f2] transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef2f2] text-lg font-semibold text-[#1E8A8A] ring-4 ring-[#eef2f2]">
                          {(testimonial.name || "C").charAt(0).toUpperCase()}
                        </div>
                      )}

                      <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-[#1E8A8A]" />
                    </div>

                    <div>
                      {testimonial.name && (
                        <h2 className="text-sm font-semibold text-[#102326] sm:text-base">
                          {testimonial.name}
                        </h2>
                      )}

                      {testimonial.role && (
                        <p className="mt-1 text-xs text-zinc-500">
                          {testimonial.role}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Slider Indicators */}
          {!isLoading && slideSets.length > 0 && (
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
          )}
        </div>
      </div>
    </section>
  );
}
