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
    link: { label: "Need help?", href: "/contact" },
  },
];

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

export default function ReachOut() {
  // Initialize WOW.js on mount (client-side only)
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
    <section className="w-full bg-[#EAEFEF] px-4 py-14 sm:px-6 sm:py-16 md:px-8 lg:px-10 lg:py-24 xl:px-16">
      <div className="mx-auto w-full max-w-7xl">
        {/* Badge */}
        <div
          data-wow-duration="0.7s"
          data-wow-delay="0s"
          data-wow-offset="50"
          className="wow animate__fadeInUp mx-auto flex w-fit items-center gap-2 rounded-full border border-[#0C1E21]/10 bg-white px-4 py-2"
        >
          <Box size={16} className="text-[#1E8A8A]" aria-hidden="true" />
          <span className="text-xs font-bold tracking-[0.15em] text-[#102326]">
            CONTACT INFO
          </span>
        </div>

        {/* Heading */}
        <h2
          data-wow-duration="0.8s"
          data-wow-delay="0.1s"
          data-wow-offset="50"
          className="wow animate__fadeInUp mt-5 text-center text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-[64px]"
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
                className="wow animate__fadeInUp flex flex-col items-center rounded-3xl bg-white px-6 py-10 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:px-8"
              >
                <span className="mb-6 flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#DCE6E6] text-[#1E8A8A] transition-transform duration-300 group-hover:scale-105">
                  <Icon size={30} aria-hidden="true" />
                </span>

                <h3 className="text-xl font-bold text-[#102326] sm:text-2xl">
                  {card.title}
                </h3>

                <div className="mt-4 flex flex-col gap-1">
                  {card.lines.map((line, lineIndex) => (
                    <p
                      key={lineIndex}
                      className="text-sm leading-6 text-[#102326]/60 sm:text-base"
                    >
                      {line}
                    </p>
                  ))}
                </div>

                {card.link && (
                  <a
                    href={card.link.href}
                    className="mt-1 text-sm font-bold text-[#1E8A8A] underline-offset-4 transition-colors duration-300 hover:underline sm:text-base"
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
