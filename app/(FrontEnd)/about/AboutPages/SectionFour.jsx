"use client";

import { Quote, Star } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const testimonials = [
  {
    id: 1,
    name: "Guy Hawkins",
    role: "Sr. Executive",
    image:
      "https://themejunction.net/html/bexon/demo/assets/images/testimonial/client-1.webp",
    comment:
      "Working with Bexon has been a game-changer for our business. Their team's professionalism, attention to detail, and innovative solutions have helped us streamline operations and achieve our goals faster than we imagined. We truly feel like a valued partner.",
  },
  {
    id: 2,
    name: "Ralph Edwards",
    role: "Co. Founder",
    image:
      "https://themejunction.net/html/bexon/demo/assets/images/testimonial/client-2.webp",
    comment:
      "The results we've seen after partnering with Bexon are beyond our expectations. They not only understood our vision but also brought new ideas to the table that have taken our business to the next level. Their expertise and commitment to success make them a trusted.",
  },
  {
    id: 3,
    name: "Devon Lane",
    role: "Sr. Manager",
    image:
      "https://themejunction.net/html/bexon/demo/assets/images/testimonial/client-3.webp",
    comment:
      "We've been working with Bexon for years, and they continue to deliver outstanding results. Their team is proactive, responsive, and always goes the extra mile to ensure our needs are met. They've become a key contributor to our growth and success.",
  },
];

export default function SectionFour() {
  const [currentSlide, setCurrentSlide] = useState(1);

  const activeTestimonial = testimonials[currentSlide];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full overflow-hidden bg-[#ECF0F0] px-6 py-14">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-stretch gap-6 md:gap-6 lg:grid-cols-2">
        <div
          data-wow-duration="0.9s"
          className="wow animate__animated animate__fadeInLeft order-2 flex min-h-[450px] flex-col rounded-[28px] bg-white p-6 shadow-[0_10px_40px_rgba(16,35,38,0.06)] sm:min-h-[500px] sm:rounded-[30px] sm:p-8 md:p-10 lg:order-1 lg:min-h-[560px] lg:p-12"
        >
          <Quote
            className="h-11 w-11 shrink-0 text-[#1E8A8A] sm:h-13 sm:w-13 lg:h-16 lg:w-16"
            fill="currentColor"
            strokeWidth={0}
          />

          <p
            key={activeTestimonial.id}
            className="animate__animated animate__fadeIn mt-6 text-[17px] leading-8 text-zinc-500 sm:mt-7 sm:text-lg sm:leading-8 md:text-xl md:leading-9 lg:mt-8 lg:text-2xl lg:leading-10"
          >
            {activeTestimonial.comment}
          </p>

          <div className="flex-1" />

          <div className="mt-0 border-t border-dashed border-zinc-300 lg:mt-15" />

          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Image
                src={activeTestimonial.image}
                alt={activeTestimonial.name}
                width={100}
                height={100}
                className="h-14 w-14 rounded-full object-cover ring-4 ring-[#ECF0F0] sm:h-16 sm:w-16"
              />

              <div>
                <h3 className="text-lg font-semibold text-[#102326] sm:text-xl">
                  {activeTestimonial.name}
                </h3>

                <p className="mt-1 text-sm text-zinc-500 sm:text-base">
                  {activeTestimonial.role}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {testimonials.map((testimonial, index) => (
                <button
                  key={testimonial.id}
                  type="button"
                  aria-label={`Show review from ${testimonial.name}`}
                  aria-current={currentSlide === index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === index
                      ? "w-9 bg-[#1E8A8A] sm:w-10"
                      : "w-2 bg-[#1E8A8A]/20 hover:bg-[#1E8A8A]/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div
          data-wow-duration="1s"
          data-wow-delay="0.15s"
          className="wow animate__animated animate__fadeInUp relative order-1 min-h-[360px] w-full lg:order-2 lg:min-h-[560px]"
        >
          <div className="relative h-full min-h-[360px] w-full overflow-hidden rounded-[28px] bg-[#0C1E21] sm:min-h-[440px] sm:rounded-[30px] lg:min-h-[560px]">
            <Image
              src="https://themejunction.net/html/bexon/demo/assets/images/testimonial/testimonial-img.webp"
              alt="Bexon clients working together"
              fill
              sizes="(max-width: 1023px) 100vw, 50vw"
              className="object-cover"
              priority={false}
            />

            <div className="absolute inset-0 bg-black/20" />

            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/15 to-transparent" />

            <h2 className="absolute top-6 right-6 left-6 z-10 max-w-[550px] text-[34px] leading-[1.05] font-bold text-white sm:top-8 sm:right-8 sm:left-8 sm:text-5xl lg:top-10 lg:left-10 lg:text-[52px] lg:leading-[1.08]">
              Hear from Our <span className="text-white/40">Customer.</span>
            </h2>
          </div>

          <div className="absolute right-0 bottom-0 z-20 rounded-tl-[48px] bg-white pt-4 pl-4 sm:rounded-tl-2xl sm:pt-5 sm:pl-5 lg:rounded-tl-2xl lg:pt-6 lg:pl-6">
            <div className="rounded-[18px] bg-[#1E8A8A] px-5 py-4 text-white shadow-[0_15px_35px_rgba(16,35,38,0.18)] sm:rounded-[20px] sm:px-6 sm:py-5 lg:px-8 lg:py-7">
              <h2 className="text-5xl leading-none font-bold sm:text-6xl lg:text-[64px]">
                4.9
              </h2>

              <div className="mt-3 flex items-center gap-1 sm:mt-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={16}
                    fill="currentColor"
                    strokeWidth={0}
                    className="sm:h-[18px] sm:w-[18px]"
                  />
                ))}
              </div>

              <span className="mt-2 block text-xs whitespace-nowrap sm:text-sm lg:text-base">
                (80+ Clients Reviews)
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
