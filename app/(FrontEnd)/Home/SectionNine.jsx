"use client";

import Image from "next/image";
import { Minus, PhoneCallIcon, Plus } from "lucide-react";
import { useState } from "react";

export default function SectionNine() {
  const [open, setOpen] = useState(null);

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

  return (
    <section className="min-h-screen w-full bg-[#ECF0F0] px-6 py-16 lg:px-12">
      <div className="flex w-full flex-col gap-8 lg:flex-row">
        {/* Image */}
        <div className="relative w-full self-start lg:w-1/2">
          <div
            className="wow animate__animated animate__fadeInLeft relative h-140 w-full overflow-hidden rounded-2xl"
            data-wow-duration="1s"
          >
            <Image
              alt="Company pic"
              fill
              src="https://themejunction.net/html/bexon/demo/assets/images/faq/faq.webp"
              className="object-cover transition-transform duration-700 hover:scale-105"
            />

            <div className="absolute inset-0 bg-linear-to-t from-[#0C1E21]/60 via-transparent to-transparent" />

            <h2
              className="wow animate__animated animate__fadeInUp absolute top-8 left-8 z-10 text-4xl leading-tight font-medium text-white md:text-5xl"
              data-wow-delay="0.3s"
            >
              Need Help? Start
              <br />
              Here...
            </h2>
          </div>

          {/* Get Started Box */}
          <div
            className="wow animate__animated animate__fadeInUp absolute right-0 bottom-0 z-20 rounded-tl-[35px] bg-[#ECF0F0] pt-4 pb-0 pl-4"
            data-wow-delay="0.5s"
          >
            <div className="w-60 rounded-2xl bg-[#1E8A8A] px-6 py-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <p className="text-2xl font-bold text-white">
                Get Started
                <br />
                Free Call?
              </p>

              <div className="mt-5 flex flex-col gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0C1E21] text-white transition-transform duration-300 hover:rotate-12">
                  <PhoneCallIcon size={20} />
                </div>

                <a
                  href="tel:18884521505"
                  className="group/phone relative w-fit text-xl font-semibold text-white"
                >
                  1-888-452-1505
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-cyan-500 transition-all duration-300 group-hover/phone:w-full" />
                </a>
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
                key={index}
                className="wow animate__animated animate__fadeInRight mb-3 overflow-hidden rounded-xl bg-white shadow-sm"
                data-wow-delay={`${index * 0.1}s`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : index)}
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
