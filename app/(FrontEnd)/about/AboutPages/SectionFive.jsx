"use client";

import Image from "next/image";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa6";
import { ArrowUpRight, Box } from "lucide-react";

const teamMembers = [
  {
    id: 1,
    name: "Eade Marren",
    role: "Chief Executive",
    image:
      "https://themejunction.net/html/bexon/demo/assets/images/team/team-1.webp",
  },
  {
    id: 2,
    name: "Savannah Ngueen",
    role: "Operations Head",
    image:
      "https://themejunction.net/html/bexon/demo/assets/images/team/team-2.webp",
  },
  {
    id: 3,
    name: "Kristin Watson",
    role: "Marketing Lead",
    image:
      "https://themejunction.net/html/bexon/demo/assets/images/team/team-3.webp",
  },
  {
    id: 4,
    name: "Darlene Robertson",
    role: "Business Director",
    image:
      "https://themejunction.net/html/bexon/demo/assets/images/team/team-4.webp",
  },
];

const socialLinks = [
  {
    name: "Instagram",
    icon: FaInstagram,
    href: "#",
  },
  {
    name: "Facebook",
    icon: FaFacebook,
    href: "#",
  },
  {
    name: "LinkedIn",
    icon: FaLinkedin,
    href: "#",
  },
  {
    name: "Twitter",
    icon: FaTwitter,
    href: "#",
  },
];

export default function SectionFive() {
  return (
    <section className="relative w-full overflow-hidden bg-[#dce8e8] px-4 py-16 sm:px-6 sm:py-20 md:px-8 lg:px-10 lg:py-24 xl:px-16">
      <div
        className="pointer-events-none absolute top-0 left-0 h-[48%] w-[48%] opacity-[0.08]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, #0C1E21 0, #0C1E21 1px, transparent 1px, transparent 12px)",
          clipPath: "polygon(0 0, 100% 0, 40% 100%, 0 70%)",
          WebkitClipPath: "polygon(0 0, 100% 0, 40% 100%, 0 70%)",
        }}
      />

      <div
        className="pointer-events-none absolute right-0 bottom-0 h-[48%] w-[48%] opacity-[0.08]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, #0C1E21 0, #0C1E21 1px, transparent 1px, transparent 12px)",
          clipPath: "polygon(100% 100%, 0 100%, 60% 0, 100% 30%)",
          WebkitClipPath: "polygon(100% 100%, 0 100%, 60% 0, 100% 30%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="mx-auto mb-10 flex max-w-3xl flex-col items-center text-center sm:mb-12 lg:mb-16">
          <span
            data-wow-duration="0.8s"
            data-wow-delay="0.05s"
            data-wow-offset="100"
            className="wow animate__animated animate__fadeInDown group inline-flex items-center gap-2 rounded-full border border-[#1E8A8A]/15 bg-white/70 px-4 py-2 text-xs font-bold tracking-[0.16em] text-[#1E8A8A] shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#1E8A8A]/30 hover:shadow-md sm:text-sm"
          >
            <Box
              size={17}
              className="transition-transform duration-500 group-hover:rotate-180"
            />
            MEET OUR TEAM
          </span>

          <h2
            data-wow-duration="0.9s"
            data-wow-delay="0.15s"
            data-wow-offset="100"
            className="wow animate__animated animate__fadeInUp mt-5 text-4xl leading-[1.05] font-medium tracking-tight text-[#102326] sm:mt-6 sm:text-5xl lg:text-[56px]"
          >
            Success Stories Fuel <br />
            Our <span className="text-[#1E8A8A]">Innovation.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member, index) => (
            <div
              key={member.id}
              data-wow-duration="0.9s"
              data-wow-delay={`${0.2 + index * 0.12}s`}
              data-wow-offset="120"
              className="wow animate__animated animate__fadeInUp group"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-[26px] bg-[#1E8A8A] transition-all duration-500 ease-out group-hover:inset-[-7px] group-hover:rotate-[2deg]" />

                <div className="relative overflow-hidden rounded-[24px] bg-white shadow-[0_12px_35px_rgba(12,30,33,0.07)] transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_25px_60px_rgba(12,30,33,0.14)]">
                  <div className="relative aspect-[0.86] overflow-hidden bg-[#eef2f2]">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-contain object-bottom transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />

                    <div className="absolute inset-0 bg-black/0 transition-all duration-500 group-hover:bg-black/70" />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                        {socialLinks.map((social, socialIndex) => {
                          const SocialIcon = social.icon;

                          return (
                            <a
                              key={social.name}
                              href={social.href}
                              aria-label={`${member.name} ${social.name}`}
                              className="flex h-10 w-10 translate-y-6 scale-90 items-center justify-center rounded-full bg-white text-[#102326] opacity-0 shadow-[0_8px_25px_rgba(0,0,0,0.22)] transition-all duration-500 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 hover:scale-110 hover:bg-[#1E8A8A] hover:text-white sm:h-11 sm:w-11"
                              style={{
                                transitionDelay: `${socialIndex * 70}ms`,
                              }}
                            >
                              <SocialIcon className="text-sm sm:text-base" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex min-h-[88px] items-center justify-between gap-4 bg-white px-5 py-5 sm:min-h-[94px] sm:px-6 sm:py-6">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg leading-tight font-bold text-[#102326] sm:text-xl">
                        {member.name}
                      </h3>

                      <p className="mt-1.5 text-sm text-zinc-500 sm:text-[15px]">
                        {member.role}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1E8A8A]/10 text-[#1E8A8A] transition-all duration-500 group-hover:rotate-45 group-hover:bg-[#1E8A8A] group-hover:text-white sm:h-11 sm:w-11">
                      <ArrowUpRight size={18} strokeWidth={2} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
