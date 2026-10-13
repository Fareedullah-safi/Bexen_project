"use client";

import Image from "next/image";
import { Minus, PhoneCallIcon, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

export default function SectionNine() {
  const [open, setOpen] = useState(null);
  const [faqData, setFaqData] = useState(null);

  useEffect(() => {
    async function getFaqData() {
      try {
        const res = await axios.get("/api/homepage/faq");

        if (res.data.success && res.data.data) {
          setFaqData(res.data.data);
        }
      } catch (error) {
        console.error(
          "Failed to load FAQ data:",
          error.response?.data?.message || error.message,
        );
      }
    }

    getFaqData();
  }, []);

  if (!faqData) return null;

  const faqs = Array.isArray(faqData.faqs) ? faqData.faqs : [];

  return (
    <section className="min-h-screen w-full bg-[#ECF0F0] px-6 py-16 lg:px-12">
      <div className="flex w-full flex-col gap-8 lg:flex-row">
        {/* Image */}
        <div className="relative w-full self-start lg:w-1/2">
          <div
            className="wow animate__animated animate__fadeInLeft relative h-140 w-full overflow-hidden rounded-2xl"
            data-wow-duration="1s"
          >
            {faqData.imageURL && (
              <Image
                alt="Company pic"
                fill
                src={faqData.imageURL}
                className="object-cover transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            )}

            <div className="absolute inset-0 bg-linear-to-t from-[#0C1E21]/60 via-transparent to-transparent" />

            <h2
              className="wow animate__animated animate__fadeInUp absolute top-8 left-8 z-10 text-4xl leading-tight font-medium text-white md:text-5xl"
              data-wow-delay="0.3s"
            >
              {faqData.headingLineOne}
              <br />
              {faqData.headingLineTwo}
            </h2>
          </div>

          {/* Get Started Box */}
          <div
            className="wow animate__animated animate__fadeInUp absolute right-0 bottom-0 z-20 rounded-tl-[35px] bg-[#ECF0F0] pt-4 pb-0 pl-4"
            data-wow-delay="0.5s"
          >
            <div className="w-60 rounded-2xl bg-[#1E8A8A] px-6 py-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <p className="text-2xl font-bold text-white">
                {faqData.callHeadingLineOne}
                <br />
                {faqData.callHeadingLineTwo}
              </p>

              <div className="mt-5 flex flex-col gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0C1E21] text-white transition-transform duration-300 hover:rotate-12">
                  <PhoneCallIcon size={20} />
                </div>

                {faqData.phoneNumber && (
                  <a
                    href={
                      faqData.phoneHref ||
                      `tel:${faqData.phoneNumber.replace(/[^\d+]/g, "")}`
                    }
                    className="group/phone relative w-fit text-xl font-semibold text-white"
                  >
                    {faqData.phoneNumber}
                    <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-cyan-500 transition-all duration-300 group-hover/phone:w-full" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="w-full lg:w-1/2">
          {faqs.map((faq, index) => {
            const isOpen = open === index;

            return (
              <div
                key={faq._id || faq.id || index}
                className="wow animate__animated animate__fadeInRight mb-3 overflow-hidden rounded-xl bg-white shadow-sm"
                data-wow-delay={`${index * 0.1}s`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full cursor-pointer items-center justify-between gap-5 px-6 py-6 text-left"
                >
                  <span className="text-lg font-semibold text-[#102326] md:text-xl">
                    {faq.question}
                  </span>

                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ${
                      isOpen
                        ? "rotate-180 border-[#1E8A8A] bg-[#1E8A8A] text-white"
                        : "border-zinc-200 bg-white text-[#102326] hover:border-[#1E8A8A] hover:bg-[#1E8A8A] hover:text-white"
                    }`}
                  >
                    {isOpen ? <Minus size={20} /> : <Plus size={20} />}
                  </span>
                </button>

                {/* Answer */}
                <div
                  className={`grid transition-all duration-500 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden px-6">
                    {/* Dotted Line */}
                    <div className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-[#1E8A8A]" />

                      <div className="flex-1 border-t border-dashed border-zinc-300" />

                      <span className="h-1 w-1 rounded-full bg-[#1E8A8A]" />
                    </div>

                    <p className="py-5 text-base leading-7 text-zinc-600 md:text-lg">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
