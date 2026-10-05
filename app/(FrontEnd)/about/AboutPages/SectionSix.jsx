"use client";

import { ArrowRight, Box, Minus, Plus } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "What services does Bexon offer to clients?",
    answer:
      "Getting started is easy! Simply reach out to us through our contact form or give us a call, and we'll schedule a consultation to discuss your project and how we can best assist you.",
  },
  {
    question: "How do I get started with Corporate Business?",
    answer:
      "Getting started is easy! Simply reach out to us through our contact form or give us a call, and we'll schedule a consultation to discuss your project and how we can best assist you.",
  },
  {
    question: "How do you ensure the success of a project?",
    answer:
      "Our team keeps you informed throughout the process, ensuring quality control, clear communication, and timely delivery from beginning to end.",
  },
  {
    question: "How long will it take to complete my project?",
    answer:
      "The timeline depends on the size and complexity of your project. After understanding your requirements, we provide a clear estimated timeline.",
  },
  {
    question: "Can I track the progress of my project?",
    answer:
      "Yes, our team keeps you updated throughout the project so you can easily follow the progress and stay informed about important milestones.",
  },
];

export default function SectionSix() {
  const [open, setOpen] = useState(null);

  return (
    <section className="relative w-full overflow-hidden bg-[#ECF0F0] px-4 py-16 sm:px-6 sm:py-20 md:px-8 lg:px-10 lg:py-24 xl:px-16">
      <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-[#1E8A8A]/5 blur-3xl" />

      <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-[#1E8A8A]/5 blur-3xl" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-14 xl:gap-20">
        <div className="flex flex-col">
          <div
            data-wow-duration="0.8s"
            data-wow-delay="0.05s"
            data-wow-offset="100"
            className="wow animate__animated animate__fadeInDown"
          >
            <span className="group inline-flex w-fit items-center gap-2 rounded-full border border-[#1E8A8A]/15 bg-white/70 px-4 py-2 text-xs font-bold tracking-[0.14em] text-[#1E8A8A] shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#1E8A8A]/30 hover:shadow-md sm:text-sm">
              <Box
                size={17}
                className="transition-transform duration-500 group-hover:rotate-180"
              />

              <span className="text-zinc-900">COMMON QUESTIONS</span>
            </span>
          </div>

          <h2
            data-wow-duration="0.9s"
            data-wow-delay="0.15s"
            data-wow-offset="100"
            className="wow animate__animated animate__fadeInLeft mt-6 max-w-xl text-4xl leading-[1.05] font-medium tracking-tight text-[#102326] sm:text-5xl lg:text-[56px]"
          >
            Need <span className="text-[#1E8A8A]">Help?</span>
            <br />
            Start Here...
          </h2>

          <p
            data-wow-duration="0.9s"
            data-wow-delay="0.28s"
            data-wow-offset="100"
            className="wow animate__animated animate__fadeInUp mt-6 max-w-lg text-sm leading-7 text-[#102326]/60 sm:text-base sm:leading-8"
          >
            We stay ahead of the curve, leveraging cutting-edge technologies and
            strategies to keep you competitive.
          </p>

          <div
            data-wow-duration="0.9s"
            data-wow-delay="0.4s"
            data-wow-offset="80"
            className="wow animate__animated animate__fadeInUp mt-8 w-full sm:mt-9"
          >
            <button
              type="button"
              className="group/button flex h-14 w-full max-w-[230px] cursor-pointer items-center justify-between overflow-hidden rounded-full bg-[#1E8A8A] py-1.5 pr-1.5 pl-6 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(30,138,138,0.18)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#177979] hover:shadow-[0_18px_40px_rgba(30,138,138,0.28)] sm:h-15 sm:max-w-[245px] sm:pl-7 sm:text-base"
            >
              <span className="overflow-hidden leading-none">
                <span className="block whitespace-nowrap transition-transform duration-400 ease-in-out [text-shadow:0_30px_0_currentColor] group-hover/button:-translate-y-[30px]">
                  Request a Call
                </span>
              </span>

              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0C1E21] transition-transform duration-300 group-hover/button:scale-105 sm:h-12 sm:w-12">
                <ArrowRight
                  size={19}
                  className="-rotate-45 text-white transition-transform duration-300 ease-in-out group-hover/button:rotate-0"
                />
              </span>
            </button>
          </div>
        </div>

        <div className="w-full">
          <div className="flex flex-col gap-3">
            {faqs.map((faq, index) => {
              const isOpen = open === index;

              return (
                <div
                  key={faq.question}
                  data-wow-duration="0.8s"
                  data-wow-delay={`${0.12 + index * 0.1}s`}
                  data-wow-offset="100"
                  className="wow animate__animated animate__fadeInRight overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_8px_30px_rgba(12,30,33,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_38px_rgba(12,30,33,0.08)]"
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="flex w-full cursor-pointer items-center justify-between gap-5 px-5 py-5 text-left sm:px-6 sm:py-6"
                  >
                    <span className="pr-2 text-base leading-7 font-semibold text-[#102326] sm:text-lg md:text-xl">
                      {faq.question}
                    </span>

                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-500 sm:h-11 sm:w-11 ${
                        isOpen
                          ? "rotate-180 border-[#1E8A8A] bg-[#1E8A8A] text-white"
                          : "border-zinc-200 bg-white text-[#102326] hover:border-[#1E8A8A] hover:bg-[#1E8A8A] hover:text-white"
                      }`}
                    >
                      {isOpen ? (
                        <Minus size={19} strokeWidth={2} />
                      ) : (
                        <Plus size={19} strokeWidth={2} />
                      )}
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-500 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden px-5 sm:px-6">
                      <div className="flex items-center gap-2">
                        <span className="h-1 w-1 shrink-0 rounded-full bg-[#1E8A8A]" />

                        <div className="flex-1 border-t border-dashed border-zinc-300" />

                        <span className="h-1 w-1 shrink-0 rounded-full bg-[#1E8A8A]" />
                      </div>

                      <p className="pt-4 pb-5 text-sm leading-7 text-zinc-500 sm:pb-6 sm:text-base sm:leading-8">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
