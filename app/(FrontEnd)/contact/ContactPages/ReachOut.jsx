"use client";

import { useEffect } from "react";
import { MapPin, Mail, Phone, MessageCircle, Box } from "lucide-react";

const CONTACT_CARDS = [
  {
    id: "location",
    icon: MapPin,
    title: "Our Location",
    lines: ["993 Renner Burg, West", "Rond, MT 94251-030"],
  },
  {
    id: "email",
    icon: Mail,
    title: "Email us",
    lines: ["support@bexon.com", "info@bexon.com"],
  },
  {
    id: "call",
    icon: Phone,
    title: "Call us",
    lines: ["+1 (009) 544-7818", "+1 (009) 880-1810"],
  },
  {
    id: "chat",
    icon: MessageCircle,
    title: "Live chat",
    lines: ["livechat@bexon.com"],
    link: {
      label: "Need help?",
      href: "/contact",
    },
  },
];

export default function ReachOut() {
  // Initialize WOW.js
  useEffect(() => {
    let wowInstance;

    (async () => {
      const { WOW } = await import("wowjs");

      wowInstance = new WOW({
        boxClass: "wow",
        animateClass: "animate__animated",
        offset: 60,
        mobile: true,
        live: true,
      });

      wowInstance.init();
    })();

    return () => {
      wowInstance?.sync?.();
    };
  }, []);

  return (
    <section className="w-full overflow-hidden bg-[#EAEFEF] px-4 py-14 sm:px-6 sm:py-16 md:px-8 lg:px-10 lg:py-24 xl:px-16">
      <div className="mx-auto w-full max-w-7xl">
        {/* Badge */}
        <div
          data-wow-duration="0.7s"
          data-wow-delay="0s"
          data-wow-offset="50"
          className="wow animate__animated animate__fadeInUp mx-auto flex w-fit items-center gap-2 rounded-sm border border-[#0C1E21]/10 bg-white px-4 py-2"
        >
          <Box size={20} className="text-[#1E8A8A]" aria-hidden="true" />

          <span className="text-sm font-bold tracking-[0.12em] text-[#102326]">
            CONTACT INFO
          </span>
        </div>

        {/* Heading */}
        <h2
          data-wow-duration="0.8s"
          data-wow-delay="0.1s"
          data-wow-offset="50"
          className="wow animate__animated animate__fadeInUp mt-5 text-center text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl"
        >
          <span className="text-[#1E8A8A]">Reach</span>{" "}
          <span className="text-[#102326]">Out to Us</span>
        </h2>

        {/* Contact cards */}
        <div className="mt-12 grid grid-cols-1 gap-5 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
          {CONTACT_CARDS.map((card, index) => {
            const Icon = card.icon;

            return (
              <div
                key={card.id}
                data-wow-duration="0.8s"
                data-wow-delay={`${0.1 + index * 0.12}s`}
                data-wow-offset="60"
                className="wow animate__animated animate__fadeInUp rounded-3xl bg-white px-6 py-10 text-center transition-shadow duration-300 hover:shadow-[0_15px_35px_rgba(30,138,138,0.12)] sm:px-8"
              >
                {/* Icon */}
                <div
                  className="mx-auto mb-6 flex h-20 w-20 cursor-pointer items-center justify-center rounded-full bg-[#DCE6E6] text-[#1E8A8A] transition-all duration-300 hover:bg-[#1E8A8A] hover:text-white"
                  title={card.title}
                >
                  <Icon size={30} strokeWidth={1.8} aria-hidden="true" />
                </div>

                {/* Title */}
                <h3
                  data-wow-duration="0.7s"
                  data-wow-delay={`${0.2 + index * 0.12}s`}
                  data-wow-offset="50"
                  className="wow animate__animated animate__fadeInUp cursor-pointer text-xl font-bold text-[#102326] transition-colors duration-300 hover:text-[#1E8A8A] sm:text-2xl"
                >
                  {card.title}
                </h3>

                {/* Contact details */}
                <div className="mt-4 flex flex-col gap-1">
                  {card.lines.map((line, lineIndex) => (
                    <p
                      key={lineIndex}
                      data-wow-duration="0.6s"
                      data-wow-delay={`${
                        0.3 + index * 0.12 + lineIndex * 0.08
                      }s`}
                      data-wow-offset="40"
                      className="wow animate__animated animate__fadeInUp cursor-pointer text-sm leading-6 text-[#102326]/60 transition-colors duration-300 hover:text-[#1E8A8A] sm:text-base"
                    >
                      {line}
                    </p>
                  ))}
                </div>

                {/* Link */}
                {card.link && (
                  <a
                    href={card.link.href}
                    data-wow-duration="0.6s"
                    data-wow-delay={`${0.45 + index * 0.12}s`}
                    data-wow-offset="40"
                    className="wow animate__animated animate__fadeInUp mt-2 inline-block cursor-pointer text-sm font-bold text-[#1E8A8A] transition-colors duration-300 hover:text-[#0C1E21] hover:underline hover:underline-offset-4 sm:text-base"
                  >
                    {card.link.label}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
