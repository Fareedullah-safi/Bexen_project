"use client";

import axios from "axios";
import { Minus, PhoneCallIcon, Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const getText = (value, language = "en") => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value[language] || value.en || value.fa || value.ps || "";
  }

  return "";
};

export default function SectionNine() {
  const [open, setOpen] = useState(null);
  const [faqData, setFaqData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const updateLanguage = (event) => {
      const lang =
        event?.detail?.language ||
        localStorage.getItem("site-language") ||
        "en";

      setLanguage(lang);
    };

    updateLanguage();
    window.addEventListener("site-language-change", updateLanguage);

    return () =>
      window.removeEventListener("site-language-change", updateLanguage);
  }, []);

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
      } finally {
        setIsLoading(false);
      }
    }

    getFaqData();
  }, []);

  if (isLoading) {
    return (
      <section className="min-h-screen w-full bg-[#ECF0F0] px-6 py-16 lg:px-12">
        <div className="flex min-h-52 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1E8A8A]/20 border-t-[#1E8A8A]" />
        </div>
      </section>
    );
  }

  if (!faqData) return null;

  const faqs = Array.isArray(faqData.faqs) ? faqData.faqs : [];

  const headingLineOne = getText(faqData.headingLineOne, language);
  const headingLineTwo = getText(faqData.headingLineTwo, language);
  const callHeadingLineOne = getText(faqData.callHeadingLineOne, language);
  const callHeadingLineTwo = getText(faqData.callHeadingLineTwo, language);
  const phoneNumber = getText(faqData.phoneNumber, language);

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
                src={faqData.imageURL}
                alt={headingLineOne || "Company"}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            )}

            <div className="absolute inset-0 bg-linear-to-t from-[#0C1E21]/60 via-transparent to-transparent" />

            {(headingLineOne || headingLineTwo) && (
              <h2
                className="wow animate__animated animate__fadeInUp absolute top-8 left-8 z-10 text-4xl leading-tight font-medium text-white md:text-5xl"
                data-wow-delay="0.3s"
              >
                {headingLineOne}
                {headingLineOne && headingLineTwo && <br />}
                {headingLineTwo}
              </h2>
            )}
          </div>

          {/* Get Started Box */}
          {(callHeadingLineOne || callHeadingLineTwo || phoneNumber) && (
            <div
              className="wow animate__animated animate__fadeInUp absolute right-0 bottom-0 z-20 rounded-tl-[35px] bg-[#ECF0F0] pt-4 pb-0 pl-4"
              data-wow-delay="0.5s"
            >
              <div className="w-60 rounded-2xl bg-[#1E8A8A] px-6 py-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                {(callHeadingLineOne || callHeadingLineTwo) && (
                  <p className="text-2xl font-bold text-white">
                    {callHeadingLineOne}
                    {callHeadingLineOne && callHeadingLineTwo && <br />}
                    {callHeadingLineTwo}
                  </p>
                )}

                {phoneNumber && (
                  <div className="mt-5 flex flex-col gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0C1E21] text-white transition-transform duration-300 hover:rotate-12">
                      <PhoneCallIcon size={20} />
                    </div>

                    <a
                      href={
                        faqData.phoneHref ||
                        `tel:${phoneNumber.replace(/[^\d+]/g, "")}`
                      }
                      className="group/phone relative w-fit text-xl font-semibold text-white"
                    >
                      {phoneNumber}
                      <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-cyan-500 transition-all duration-300 group-hover/phone:w-full" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* FAQ */}
        <div className="w-full lg:w-1/2">
          {faqs.map((faq, index) => {
            const isOpen = open === index;

            return (
              <div
                key={faq._id || faq.id || `faq-${index}`}
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
                    {getText(faq.question, language)}
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
                    <div className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-[#1E8A8A]" />
                      <div className="flex-1 border-t border-dashed border-zinc-300" />
                      <span className="h-1 w-1 rounded-full bg-[#1E8A8A]" />
                    </div>

                    <p className="py-5 text-base leading-7 text-zinc-600 md:text-lg">
                      {getText(faq.answer, language)}
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
