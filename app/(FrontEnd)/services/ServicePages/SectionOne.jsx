"use client";

// Services section

import {
  ArrowUpRight,
  BriefcaseBusiness,
  GraduationCap,
  Leaf,
  Megaphone,
  MonitorCog,
  UsersRound,
} from "lucide-react";

// Service data

const services = [
  {
    id: 1,
    title: "Business Strategy Development",
    description:
      "We help businesses build clear strategies that improve performance, uncover new opportunities, and create sustainable long-term growth.",
    icon: BriefcaseBusiness,
  },
  {
    id: 2,
    title: "Customer Experience Solutions",
    description:
      "We create meaningful customer experiences that strengthen relationships, improve satisfaction, and build lasting customer loyalty.",
    icon: UsersRound,
  },
  {
    id: 3,
    title: "IT Support & Maintenance",
    description:
      "We keep your technology reliable, secure, and efficient with professional support and maintenance tailored to your business.",
    icon: MonitorCog,
  },
  {
    id: 4,
    title: "Sustainability and ESG Consulting",
    description:
      "We develop responsible strategies that support sustainable growth, stronger stakeholder trust, and long-term business value.",
    icon: Leaf,
  },
  {
    id: 5,
    title: "Training and Development Programs",
    description:
      "We equip teams with practical knowledge, modern skills, and development programs that improve performance and encourage continuous growth.",
    icon: GraduationCap,
  },
  {
    id: 6,
    title: "Marketing Strategy & Campaigns",
    description:
      "We build focused marketing strategies that strengthen your brand, connect with the right audience, and drive measurable growth.",
    icon: Megaphone,
  },
];

export default function SectionOne() {
  return (
    <section className="w-full bg-[#ECF0F0] px-4 py-14 sm:px-6 sm:py-16 md:px-8 lg:px-10 lg:py-24 xl:px-16">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Service cards */}
        {services.map((service, index) => {
          const Icon = service.icon;

          return (
            <div
              key={service.id}
              data-wow-duration="0.9s"
              data-wow-delay={`${0.1 + index * 0.08}s`}
              data-wow-offset="100"
              className="wow animate__animated animate__fadeInUp group h-full"
            >
              {/* Single service card */}
              <div className="relative flex h-full min-h-[500px] flex-col overflow-hidden rounded-[24px] border border-[#102326]/[0.05] bg-white p-6 shadow-[0_10px_32px_rgba(12,30,33,0.05)] transition-all duration-700 ease-out hover:-translate-y-2 hover:border-[#1E8A8A]/20 hover:bg-[#1E8A8A] hover:shadow-[0_24px_55px_rgba(30,138,138,0.2)] sm:min-h-[530px] sm:rounded-[26px] sm:p-7 md:min-h-[540px] lg:min-h-[570px] lg:p-8 xl:min-h-[590px]">
                <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-[#1E8A8A]/[0.045] blur-[1px] transition-all duration-1000 ease-out group-hover:scale-[3] group-hover:bg-white/[0.1] sm:h-44 sm:w-44 lg:h-48 lg:w-48" />

                <div className="pointer-events-none absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-[#1E8A8A]/[0.035] transition-all duration-1000 group-hover:scale-[2.5] group-hover:bg-white/[0.06] sm:h-36 sm:w-36 lg:h-40 lg:w-40" />

                <div className="pointer-events-none absolute top-0 right-0 h-px w-0 bg-white/40 transition-all duration-700 group-hover:w-full" />

                <div className="relative z-10 flex h-full flex-col">
                  {/* Icon */}
                  <div className="flex items-start justify-between">
                    <div className="relative">
                      <div className="absolute inset-[-5px] rounded-full border border-[#1E8A8A]/10 transition-all duration-700 group-hover:scale-110 group-hover:border-white/20 sm:inset-[-7px]" />

                      <div className="absolute inset-[-10px] rounded-full border border-[#1E8A8A]/5 opacity-70 transition-all duration-700 group-hover:scale-105 group-hover:border-white/10 sm:inset-[-13px]" />

                      <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-white/80 bg-[radial-gradient(circle_at_30%_25%,#ffffff_0%,#eef8f7_32%,#dcefed_68%,#cbe5e3_100%)] text-[#1E8A8A] shadow-[inset_0_2px_6px_rgba(255,255,255,0.9),0_10px_25px_rgba(30,138,138,0.1)] transition-all duration-700 group-hover:scale-110 group-hover:rotate-[5deg] group-hover:bg-white group-hover:shadow-[inset_0_2px_8px_rgba(255,255,255,0.95),0_16px_35px_rgba(0,0,0,0.14)] sm:h-22 sm:w-22 md:h-24 md:w-24 lg:h-[104px] lg:w-[104px]">
                        <div className="absolute inset-2 rounded-full border border-[#1E8A8A]/10 transition-colors duration-500 group-hover:border-[#1E8A8A]/20 sm:inset-2.5" />

                        <Icon
                          size={32}
                          strokeWidth={1.7}
                          className="relative z-10 transition-all duration-700 ease-out group-hover:scale-110 group-hover:-rotate-[5deg] sm:h-9 sm:w-9 md:h-10 md:w-10"
                        />
                      </div>
                    </div>

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#1E8A8A]/10 text-[#1E8A8A]/60 transition-all duration-700 group-hover:rotate-45 group-hover:border-white/20 group-hover:bg-white/10 group-hover:text-white sm:h-9 sm:w-9">
                      <ArrowUpRight size={15} className="sm:h-4 sm:w-4" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mt-12 sm:mt-14 lg:mt-16">
                    <h3 className="max-w-[340px] text-[24px] leading-[1.2] font-semibold tracking-[-0.02em] text-[#102326] transition-all duration-700 ease-out group-hover:-translate-y-1 group-hover:text-white sm:text-[27px] md:text-[28px] lg:text-[29px]">
                      {service.title}
                    </h3>

                    <p className="mt-5 max-w-[375px] text-[16px] leading-8 text-[#102326]/55 transition-all duration-700 ease-out group-hover:-translate-y-1 group-hover:text-white/80 sm:text-[17px] sm:leading-8 md:text-[18px]">
                      {service.description}
                    </p>
                  </div>

                  {/* Learn more button */}
                  <div className="mt-auto pt-8 sm:pt-10">
                    <a
                      href="/service-details"
                      className="group/btn inline-flex items-center gap-2.5 text-[15px] font-semibold text-[#102326] transition-all duration-500 group-hover:text-white sm:gap-3 sm:text-base md:text-[17px]"
                    >
                      <span className="relative transition-transform duration-500 group-hover/btn:translate-x-1">
                        Learn More
                        <span className="absolute right-0 -bottom-1 left-0 h-px origin-left scale-x-0 bg-current transition-transform duration-500 group-hover/btn:scale-x-100" />
                      </span>

                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0C1E21] text-white transition-all duration-500 group-hover/btn:scale-110 group-hover/btn:rotate-45 group-hover/btn:bg-white group-hover/btn:text-[#0C1E21] sm:h-10 sm:w-10">
                        <ArrowUpRight
                          size={16}
                          strokeWidth={2}
                          className="transition-transform duration-500 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 sm:h-[17px] sm:w-[17px]"
                        />
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
