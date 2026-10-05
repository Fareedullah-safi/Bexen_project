"use client";

// ============================================================================
// SectionOne — Service Details Page
// ----------------------------------------------------------------------------
// Uses WOW.js + animate.css for scroll/on-load entrance animations.
// FAQ accordion uses a pure CSS height transition (no animation library).
// ============================================================================

import { useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Minus,
  Grid3x3,
  Phone,
} from "lucide-react";

// ----------------------------------------------------------------------------
// Constants
// ----------------------------------------------------------------------------

const IMG_BASE =
  "https://themejunction.net/html/bexon/demo/assets/images/service";

const ICON_SIZE_SM = 15;
const ICON_SIZE_MD = 16;
const ICON_SIZE_LG = 18;

// ----------------------------------------------------------------------------
// Static content
// ----------------------------------------------------------------------------

const FEATURES = [
  { id: "feat-1", label: "Personalization at Scale" },
  { id: "feat-2", label: "Improved Customer Retention" },
  { id: "feat-3", label: "Data-Driven Insights" },
  { id: "feat-4", label: "Omni-channel Integration" },
  { id: "feat-5", label: "Customer Retention" },
  { id: "feat-6", label: "Support Optimization" },
  { id: "feat-7", label: "Proactive Engagement" },
];

const MORE_SERVICES = [
  { id: "svc-1", label: "Customer Experience", href: "/service-details" },
  { id: "svc-2", label: "Training Programs", href: "/service-details" },
  { id: "svc-3", label: "Business Strategy", href: "/service-details" },
  { id: "svc-4", label: "Training Program", href: "/service-details" },
  { id: "svc-5", label: "ESG Consulting", href: "/service-details" },
  { id: "svc-6", label: "Development Hub", href: "/service-details" },
];

const BENEFITS = [
  {
    id: "benefit-1",
    number: "01",
    title: "Increased Customer Satisfaction",
    text: "By providing consistent, personalized experience, customers are more likely to feel valued and satisfied, which directly impacts loyalty.",
  },
  {
    id: "benefit-2",
    number: "02",
    title: "Improved Operational Efficiency",
    text: "With our tools and strategies, your customer support teams can handle inquiries faster, while automated systems reduce manual workload.",
  },
  {
    id: "benefit-3",
    number: "03",
    title: "Insights for Continuous Improvement",
    text: "Our data-driven approach provides teams with valuable insights into customer behavior, enabling continual growth and refinement.",
  },
];

const FAQS = [
  {
    id: "faq-1",
    question: "What is Customer Experience (CX) and why is it important?",
    answer:
      "Customer Experience refers to the overall impression customers form through every interaction with a business, including websites, support, services, and brand communication. A strong experience can improve satisfaction, loyalty, and long-term relationships.",
  },
  {
    id: "faq-2",
    question: "How can your Customer Experience Solutions benefit?",
    answer:
      "Our solutions help optimize customer touchpoints and create smoother, more personalized interactions. This can support stronger customer satisfaction, retention, loyalty, and better customer engagement.",
  },
  {
    id: "faq-3",
    question: "How do you personalize the customer experience?",
    answer:
      "We study customer journeys, behaviors, and touchpoints to identify opportunities for personalization. These insights help create experiences that feel more relevant and consistent across digital and service channels.",
  },
  {
    id: "faq-4",
    question: "What kind of tools do you use to improve customer experience?",
    answer:
      "We use customer journey analysis, digital platforms, automation, analytics, feedback systems, and other technology solutions to improve customer interactions and service efficiency.",
  },
  {
    id: "faq-5",
    question: "How do you collect customer feedback?",
    answer:
      "Customer feedback can be gathered through surveys, support interactions, digital channels, reviews, and direct customer communication. These insights help identify improvements and changing customer expectations.",
  },
  {
    id: "faq-6",
    question: "Can you help improve our customer support system?",
    answer:
      "Yes. We can assess existing support processes, identify bottlenecks, improve workflows, and introduce technology-driven solutions that help teams respond more efficiently.",
  },
];

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

export default function SectionOne() {
  const [openFaq, setOpenFaq] = useState(0);
  const faqBaseId = useId();

  return (
    <section className="w-full bg-white px-4 py-14 sm:px-6 sm:py-16 md:px-8 lg:px-10 lg:py-24 xl:px-16">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-14 xl:grid-cols-[minmax(0,1fr)_350px] xl:gap-20">
        {/* ------------------------------------------------------------- */}
        {/* Left content                                                   */}
        {/* ------------------------------------------------------------- */}

        <main className="min-w-0">
          {/* Hero image */}
          <div
            data-wow-duration="1s"
            data-wow-delay="0.1s"
            data-wow-offset="60"
            className="wow animate__animated animate__fadeInUp relative overflow-hidden rounded-2xl sm:rounded-3xl"
          >
            <Image
              src={`${IMG_BASE}/service-details.webp`}
              alt="Customer Experience"
              width={1000}
              height={700}
              priority
              sizes="(max-width: 1024px) 100vw, 70vw"
              className="xs:h-[200px] h-[180px] w-full object-cover transition-transform duration-700 hover:scale-[1.03] sm:h-[280px] md:h-[360px] lg:h-[420px]"
            />
          </div>

          {/* Heading + intro */}
          <div className="mt-7 sm:mt-10">
            <h1
              data-wow-duration="0.9s"
              data-wow-delay="0.15s"
              data-wow-offset="60"
              className="wow animate__animated animate__fadeInUp xs:text-3xl text-[26px] leading-[1.18] font-medium tracking-tight text-[#102326] sm:text-4xl md:text-5xl"
            >
              Transforming Customer:{" "}
              <span className="text-[#1E8A8A]">
                Tailored Solutions for Experiences.
              </span>
            </h1>

            <p
              data-wow-duration="0.8s"
              data-wow-delay="0.25s"
              data-wow-offset="60"
              className="wow animate__animated animate__fadeInUp mt-5 text-sm leading-7 text-[#102326]/65 sm:mt-6 sm:text-base sm:leading-8"
            >
              Exceptional customer experiences are at the heart of every
              successful business. Our Customer Experience Solutions help
              transform every interaction into a meaningful and positive
              experience.
            </p>

            <p
              data-wow-duration="0.8s"
              data-wow-delay="0.35s"
              data-wow-offset="60"
              className="wow animate__animated animate__fadeInUp mt-4 text-sm leading-7 text-[#102326]/65 sm:text-base sm:leading-8"
            >
              By understanding the customer journey and creating personalized,
              seamless experiences, businesses can improve customer
              satisfaction, loyalty, and long-term value.
            </p>

            <p
              data-wow-duration="0.8s"
              data-wow-delay="0.45s"
              data-wow-offset="60"
              className="wow animate__animated animate__fadeInUp mt-4 text-sm leading-7 text-[#102326]/65 sm:text-base sm:leading-8"
            >
              Our approach is comprehensive and data-driven. We assess customer
              touchpoints, identify areas for improvement, and develop
              strategies that adapt to evolving customer needs.
            </p>
          </div>

          {/* Feature list */}
          <div className="mt-7 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2">
            {FEATURES.map((feature, index) => (
              <div
                key={feature.id}
                data-wow-duration="0.7s"
                data-wow-delay={`${0.1 + index * 0.07}s`}
                data-wow-offset="50"
                className="wow animate__animated animate__fadeInUp group flex items-center gap-3 rounded-xl px-2"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1E8A8A] text-white">
                  <Check
                    size={ICON_SIZE_SM}
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                </span>

                <span className="text-sm font-semibold text-[#0C1E21] sm:text-[15px]">
                  {feature.label}
                </span>
              </div>
            ))}
          </div>

          {/* Supporting images */}
          <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-14 sm:gap-5 md:grid-cols-2 md:gap-6">
            <div
              data-wow-duration="0.9s"
              data-wow-delay="0.1s"
              data-wow-offset="60"
              className="wow animate__animated animate__fadeInLeft overflow-hidden rounded-2xl sm:rounded-3xl"
            >
              <Image
                src={`${IMG_BASE}/service-3.webp`}
                alt="Customer service team at work"
                width={800}
                height={600}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="h-[240px] w-full object-cover transition-transform duration-700 hover:scale-105 sm:h-[300px] md:h-[420px]"
              />
            </div>

            <div
              data-wow-duration="0.9s"
              data-wow-delay="0.2s"
              data-wow-offset="60"
              className="wow animate__animated animate__fadeInRight overflow-hidden rounded-2xl sm:rounded-3xl"
            >
              <Image
                src={`${IMG_BASE}/service-4.webp`}
                alt="Business discussing customer experience strategy"
                width={800}
                height={600}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="h-[240px] w-full object-cover transition-transform duration-700 hover:scale-105 sm:h-[300px] md:h-[420px]"
              />
            </div>
          </div>

          {/* Services intro */}
          <div className="mt-10 sm:mt-16">
            <h2
              data-wow-duration="0.8s"
              data-wow-delay="0.1s"
              data-wow-offset="60"
              className="wow animate__animated animate__fadeInUp xs:text-3xl text-[26px] font-medium tracking-tight text-[#102326] sm:text-4xl"
            >
              Our Range of Customer Services
            </h2>

            <p
              data-wow-duration="0.8s"
              data-wow-delay="0.2s"
              data-wow-offset="60"
              className="wow animate__animated animate__fadeInUp mt-4 text-sm leading-7 text-[#102326]/65 sm:mt-5 sm:text-base sm:leading-8"
            >
              We do not just focus on solving customer problems. We focus on
              creating experiences that delight customers and build lasting
              relationships. Through better service operations, technology, and
              engaging digital experiences, we help businesses understand their
              customers and improve every interaction.
            </p>
          </div>

          {/* Benefits — stacked rows */}
          <div className="mt-8 flex flex-col sm:mt-10">
            {BENEFITS.map((item, index) => (
              <div
                key={item.id}
                data-wow-duration="0.8s"
                data-wow-delay={`${0.1 + index * 0.12}s`}
                data-wow-offset="60"
                className={`wow animate__animated animate__fadeInUp flex flex-col gap-2 py-5 sm:flex-row sm:items-start sm:gap-8 sm:py-6 ${
                  index === BENEFITS.length - 1
                    ? ""
                    : "border-b border-[#0C1E21]/10"
                }`}
              >
                <span className="shrink-0 text-sm font-bold tracking-wider text-[#1E8A8A]">
                  {item.number}
                </span>

                <div>
                  <h3 className="text-lg font-semibold text-[#0C1E21] sm:text-xl md:text-2xl">
                    {item.title}
                  </h3>

                  <p className="mt-2 max-w-2xl text-sm leading-7 text-[#102326]/60 sm:text-base">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-14 sm:mt-20">
            <h2
              data-wow-duration="0.8s"
              data-wow-delay="0.1s"
              data-wow-offset="60"
              className="wow animate__animated animate__fadeInUp xs:text-3xl text-[26px] font-medium tracking-tight text-[#102326] sm:text-4xl"
            >
              Frequently asked questions
            </h2>

            <div
              style={{ contain: "layout" }}
              className="mt-6 flex flex-col gap-3 sm:mt-7"
            >
              {FAQS.map((faq, index) => {
                const isOpen = openFaq === index;
                const panelId = `${faqBaseId}-panel-${index}`;
                const buttonId = `${faqBaseId}-button-${index}`;

                return (
                  <div
                    key={faq.id}
                    data-wow-duration="0.7s"
                    data-wow-delay={`${0.1 + index * 0.08}s`}
                    data-wow-offset="50"
                    style={{ contain: "layout" }}
                    className={`wow animate__animated animate__fadeInUp overflow-hidden rounded-2xl border transition-colors duration-500 ${
                      isOpen
                        ? "border-[#1E8A8A] bg-[#1E8A8A]"
                        : "border-[#0C1E21]/8 bg-[#F5F7F7]"
                    }`}
                  >
                    <button
                      type="button"
                      id={buttonId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      className="flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-4 text-left focus-visible:ring-2 focus-visible:ring-[#1E8A8A] focus-visible:ring-offset-2 focus-visible:outline-none sm:gap-5 sm:px-6 sm:py-5"
                    >
                      <span
                        className={`text-sm leading-6 font-semibold transition-colors duration-500 sm:text-base ${
                          isOpen ? "text-white" : "text-[#0C1E21]"
                        }`}
                      >
                        {faq.question}
                      </span>

                      <span
                        className={`flex shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500 ease-in-out ${
                          isOpen
                            ? "h-[38px] w-[38px] border-white text-white"
                            : "h-8 w-8 border-[#1E8A8A] text-[#1E8A8A]"
                        }`}
                      >
                        {isOpen ? (
                          <Minus size={ICON_SIZE_MD} aria-hidden="true" />
                        ) : (
                          <Plus size={ICON_SIZE_MD} aria-hidden="true" />
                        )}
                      </span>
                    </button>

                    {/* Pure CSS slow-mo height transition */}
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className={`grid transition-all duration-700 ease-in-out ${
                        isOpen
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="mx-4 border-t border-dashed border-white/25 sm:mx-6" />

                        <p className="px-4 pt-4 pb-4 text-sm leading-7 text-white/85 transition-all duration-500 sm:px-6 sm:pb-5">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Previous / Grid / Next */}
          <nav
            data-wow-duration="0.6s"
            data-wow-delay="0.1s"
            data-wow-offset="50"
            aria-label="Service navigation"
            className="wow animate__animated animate__fadeInUp mt-6 flex items-center justify-between rounded-2xl border border-[#0C1E21]/8 bg-[#F5F7F7] px-4 py-4 sm:px-8 sm:py-5"
          >
            <Link
              href="/service-details"
              aria-label="Previous service"
              className="group inline-flex items-center gap-2.5 text-sm font-semibold text-[#0C1E21] transition-colors duration-300 hover:text-[#1E8A8A] focus-visible:ring-2 focus-visible:ring-[#1E8A8A] focus-visible:ring-offset-2 focus-visible:outline-none sm:gap-3"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm transition-all duration-300 group-hover:bg-[#1E8A8A] group-hover:text-white sm:h-11 sm:w-11">
                <ArrowLeft size={ICON_SIZE_LG} aria-hidden="true" />
              </span>

              <span className="hidden sm:inline">Previous</span>
            </Link>

            <Link
              href="/service-details"
              aria-label="View all services"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0C1E21] text-white transition-all duration-300 hover:bg-[#1E8A8A] focus-visible:ring-2 focus-visible:ring-[#1E8A8A] focus-visible:ring-offset-2 focus-visible:outline-none sm:h-11 sm:w-11"
            >
              <Grid3x3 size={ICON_SIZE_LG} aria-hidden="true" />
            </Link>

            <Link
              href="/service-details"
              aria-label="Next service"
              className="group inline-flex items-center gap-2.5 text-sm font-semibold text-[#0C1E21] transition-colors duration-300 hover:text-[#1E8A8A] focus-visible:ring-2 focus-visible:ring-[#1E8A8A] focus-visible:ring-offset-2 focus-visible:outline-none sm:gap-3"
            >
              <span className="hidden sm:inline">Next</span>

              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm transition-all duration-300 group-hover:bg-[#1E8A8A] group-hover:text-white sm:h-11 sm:w-11">
                <ArrowRight size={ICON_SIZE_LG} aria-hidden="true" />
              </span>
            </Link>
          </nav>
        </main>

        {/* ------------------------------------------------------------- */}
        {/* Right sidebar                                                  */}
        {/* ------------------------------------------------------------- */}

        <aside
          style={{ contain: "layout" }}
          className="will-change-transform lg:sticky lg:top-10 lg:self-start"
        >
          {/* More services */}
          <div
            data-wow-duration="0.9s"
            data-wow-delay="0.15s"
            data-wow-offset="60"
            className="wow animate__animated animate__fadeInRight rounded-2xl bg-[#ECF0F0] p-5 sm:rounded-3xl sm:p-6"
          >
            <div className="mb-5">
              <span className="text-xs font-bold tracking-[0.18em] text-[#1E8A8A]">
                SERVICES
              </span>

              <h3 className="mt-2 text-xl font-medium text-[#0C1E21] sm:text-2xl">
                More services
              </h3>
            </div>

            <div className="flex flex-col gap-2">
              {MORE_SERVICES.map((service, index) => (
                <Link
                  key={service.id}
                  href={service.href}
                  data-wow-duration="0.7s"
                  data-wow-delay={`${0.15 + index * 0.08}s`}
                  data-wow-offset="40"
                  className={`wow animate__animated animate__fadeInUp group flex min-h-14 items-center justify-between gap-3 rounded-xl px-4 py-3.5 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#1E8A8A] focus-visible:ring-offset-2 focus-visible:outline-none ${
                    index === 0
                      ? "bg-[#1E8A8A] text-white shadow-[0_12px_30px_rgba(30,138,138,0.18)]"
                      : "bg-white text-[#0C1E21] hover:-translate-y-0.5 hover:bg-[#1E8A8A] hover:text-white hover:shadow-md"
                  }`}
                >
                  <span className="text-sm leading-5 font-semibold">
                    {service.label}
                  </span>

                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                      index === 0
                        ? "bg-white/15"
                        : "bg-[#ECF0F0] group-hover:bg-white/15"
                    }`}
                  >
                    <ArrowRight
                      size={ICON_SIZE_SM}
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Promo card */}
          <div
            data-wow-duration="0.8s"
            data-wow-delay="0.3s"
            data-wow-offset="60"
            className="wow animate__animated animate__fadeInUp relative mt-5 overflow-hidden rounded-2xl bg-[#0C1E21] p-6 pb-0 text-white sm:rounded-3xl"
          >
            <h3 className="text-4xl leading-none font-bold sm:text-5xl">
              Modern
            </h3>

            <p className="mt-2 text-lg text-white/80 sm:text-xl">
              Home Makeover
            </p>

            <a
              href="tel:+8321890640"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#1E8A8A] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#167575] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <Phone size={ICON_SIZE_SM} aria-hidden="true" />
              +8 (321) 890-640
            </a>

            {/* Image bleeding off the card */}
            <div className="relative mt-6 flex justify-end sm:mt-8">
              <div className="xs:h-56 xs:w-56 relative -mr-8 -mb-8 h-48 w-48 overflow-hidden rounded-full border-[3px] border-[#1E8A8A] sm:-mr-12 sm:-mb-12 sm:h-64 sm:w-64 md:-mr-16 md:-mb-16 md:h-72 md:w-72">
                <Image
                  src={`${IMG_BASE}/service-ad.webp`}
                  alt="Customer experience consultant"
                  fill
                  sizes="(max-width: 640px) 192px, (max-width: 768px) 256px, 288px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
