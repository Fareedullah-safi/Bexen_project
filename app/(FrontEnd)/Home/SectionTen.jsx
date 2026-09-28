"use client";

import { ArrowRight, Box, ChevronDown } from "lucide-react";

export default function SectionTen() {
  const regions = [
    {
      id: 1,
      title: "Head office:",
      address: "993 Renner Burg, West Rond, MT 94251-030, USA.",
      phone: "P: +1 (009) 544-7818",
      email: "M: support@bexon.com",
      position:
        "left-[20%] top-[42%] sm:left-[23%] sm:top-[43%] md:left-[24%] md:top-[42%] lg:left-[20%] lg:top-[45%]",
    },
    {
      id: 2,
      title: "Regional office:",
      address: "Hessisch Lichtenau 37235, Kassel, Germany.",
      phone: "P: +1 (009) 880-1810",
      email: "M: support@bexon.com",
      position:
        "left-[55%] top-[32%] sm:left-[54%] sm:top-[34%] md:left-[54%] md:top-[33%] lg:left-[52%] lg:top-[38%]",
    },
    {
      id: 3,
      title: "Regional office:",
      address: "32 Altamira, State of Pará, Brazil.",
      phone: "P: +1 (009) 544-7818",
      email: "M: support@bexon.com",
      position:
        "left-[34%] top-[68%] sm:left-[36%] sm:top-[68%] md:left-[36%] md:top-[68%] lg:left-[31%] lg:top-[72%]",
    },
  ];

  return (
    <section className="w-full bg-[#e7eded] px-4 py-6 sm:py-10 md:py-12 lg:py-16">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#081f22] [background-image:url('https://themejunction.net/html/bexon/demo/assets/images/bg/map.svg')] [background-size:170%_auto] [background-position:center_8%] bg-no-repeat sm:rounded-[28px] sm:[background-size:130%_auto] sm:[background-position:center_5%] md:[background-size:110%_auto] md:[background-position:center_8%] lg:rounded-[30px] lg:[background-size:64%_auto] lg:[background-position:left_center]">
        {/* Dark atmosphere */}
        <div className="absolute inset-0 bg-[#081f22]/90" />

        {/* Teal glow */}
        <div className="pointer-events-none absolute top-10 -left-40 h-87.5 w-87.5 rounded-full bg-[#1E8A8A]/14 blur-[120px] sm:h-[420px] sm:w-[420px] md:h-[450px] md:w-[450px] md:blur-[150px]" />

        {/* Secondary glow */}
        <div className="pointer-events-none absolute bottom-[-160px] left-[30%] h-[350px] w-[350px] rounded-full bg-[#1E8A8A]/10 blur-[120px] sm:h-[400px] sm:w-[400px] md:h-[420px] md:w-[420px] md:blur-[140px]" />

        {/* Soft top light */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-60 bg-gradient-to-b from-white/[0.025] to-transparent sm:h-72 md:h-80" />

        {/* Diagonal texture */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.16]">
          <div className="absolute -top-72 -left-60 h-[800px] w-[650px] -rotate-[28deg] bg-[repeating-linear-gradient(100deg,transparent_0,transparent_25px,rgba(125,211,211,0.12)_26px,transparent_27px)]" />

          <div className="absolute -right-60 -bottom-72 h-[800px] w-[650px] rotate-[28deg] bg-[repeating-linear-gradient(100deg,transparent_0,transparent_25px,rgba(125,211,211,0.08)_26px,transparent_27px)]" />
        </div>

        {/* Main layout */}
        <div className="relative z-10 flex flex-col lg:grid lg:grid-cols-[1fr_1fr]">
          {/* ================= MAP ================= */}
          <div className="relative min-h-97.5 sm:min-h-[470px] md:min-h-[540px] lg:min-h-[760px]">
            {regions.map((region, index) => (
              <div
                key={region.id}
                data-wow-duration="0.8s"
                data-wow-delay={`${0.2 + index * 0.15}s`}
                className={`wow animate__animated animate__fadeIn group absolute ${region.position} z-30`}
              >
                {/* Glow */}
                <span className="absolute -inset-2.5 rounded-full bg-[#1E8A8A]/20 blur-md sm:-inset-3 md:-inset-4" />

                {/* Pulse */}
                <span className="absolute -inset-2 animate-ping rounded-full bg-[#1E8A8A]/25 sm:-inset-2.5 md:-inset-3" />

                {/* Dot */}
                <button
                  type="button"
                  aria-label={region.title}
                  className="relative h-3 w-3 cursor-pointer rounded-full border border-white bg-white shadow-[0_0_12px_rgba(255,255,255,0.65)] transition-all duration-300 group-hover:scale-125 group-hover:border-[#72f4e8] sm:h-4 sm:w-4 md:h-5 md:w-5 md:shadow-[0_0_18px_rgba(255,255,255,0.7)] lg:h-7 lg:w-7 lg:border-2 lg:shadow-[0_0_22px_rgba(255,255,255,0.7)]"
                >
                  <span className="absolute inset-0.5 rounded-full bg-[#1E8A8A] opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:inset-1 lg:inset-1.5" />
                </button>

                {/* Hover information */}
                <div className="pointer-events-none absolute bottom-7 left-1/2 w-[220px] -translate-x-1/2 translate-y-3 bg-[#249596] px-3 py-3 text-left opacity-0 shadow-2xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:bottom-8 sm:w-[250px] sm:px-4 sm:py-4 md:bottom-9 md:w-[280px] md:px-5 lg:bottom-11 lg:w-[330px] lg:px-6 lg:py-5">
                  <p className="text-xs leading-5 font-medium text-white sm:text-sm sm:leading-6 lg:text-lg lg:leading-7">
                    {region.title}
                  </p>

                  <p className="mt-1.5 text-xs leading-5 font-medium text-white sm:mt-2 sm:text-sm sm:leading-6 lg:text-lg lg:leading-7">
                    {region.address}
                  </p>

                  <p className="mt-1.5 text-xs leading-5 font-medium text-white sm:mt-2 sm:text-sm sm:leading-6 lg:text-lg lg:leading-7">
                    {region.phone}
                  </p>

                  <p className="text-xs leading-5 font-medium text-white sm:text-sm sm:leading-6 lg:text-lg lg:leading-7">
                    {region.email}
                  </p>

                  {/* Pointer */}
                  <div className="absolute -bottom-2 left-1/2 h-0 w-0 -translate-x-1/2 border-t-[9px] border-r-[9px] border-l-[9px] border-t-[#249596] border-r-transparent border-l-transparent sm:-bottom-2.5 sm:border-t-[11px] sm:border-r-[11px] sm:border-l-[11px] lg:-bottom-3 lg:border-t-[14px] lg:border-r-[14px] lg:border-l-[14px]" />
                </div>
              </div>
            ))}

            {/* Map label */}
            <div
              data-wow-duration="0.8s"
              className="wow animate__animated animate__fadeIn absolute bottom-6 left-5 hidden items-center gap-2 text-[10px] font-medium tracking-[0.18em] text-white/35 sm:flex md:bottom-8 md:left-8 md:text-xs lg:bottom-8 lg:left-10"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#1E8A8A] sm:h-2 sm:w-2" />
              GLOBAL PRESENCE
            </div>
          </div>

          {/* ================= CONTACT FORM ================= */}
          <div className="relative z-40 flex w-full items-center justify-center px-3 pb-5 sm:px-6 sm:pb-8 md:px-8 md:pb-10 lg:px-10 lg:py-10 xl:px-12">
            <div className="w-full max-w-[650px] rounded-[22px] border border-white/10 bg-black/[0.04] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.3)] backdrop-blur-2xl sm:rounded-[26px] sm:p-7 md:p-9 lg:p-10 xl:p-11">
              {/* Badge */}
              <span
                data-wow-duration="0.8s"
                className="wow animate__animated animate__fadeInDown inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-bold tracking-wide text-white sm:px-4 sm:py-2 sm:text-xs md:text-sm"
              >
                <Box size={16} className="text-[#1E8A8A] sm:size-[17px]" />
                GET IN TOUCH
              </span>

              {/* Heading */}
              <h1
                data-wow-duration="0.9s"
                data-wow-delay="0.1s"
                className="wow animate__animated animate__fadeInUp mt-5 max-w-xl text-3xl leading-tight font-medium tracking-tight text-white sm:mt-6 sm:text-4xl md:text-5xl lg:text-[56px]"
              >
                Drop Us a <span className="text-[#1E8A8A]">Line.</span>
              </h1>

              {/* Form */}
              <form className="mt-7 sm:mt-9 md:mt-10">
                <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2 sm:gap-x-7 sm:gap-y-7 md:gap-y-8">
                  {/* Name */}
                  <div
                    data-wow-duration="0.8s"
                    data-wow-delay="0.15s"
                    className="wow animate__animated animate__fadeInUp group"
                  >
                    <label
                      htmlFor="fullName"
                      className="block text-xs text-white/60 transition-colors duration-300 group-focus-within:text-[#58eee0] sm:text-sm md:text-base"
                    >
                      Full Name *
                    </label>

                    <input
                      id="fullName"
                      type="text"
                      className="mt-2 w-full border-b border-white/10 bg-transparent pb-2.5 text-sm text-white transition-all duration-300 outline-none focus:border-[#1E8A8A] sm:mt-3 sm:pb-3 md:pb-4"
                    />
                  </div>

                  {/* Email */}
                  <div
                    data-wow-duration="0.8s"
                    data-wow-delay="0.2s"
                    className="wow animate__animated animate__fadeInUp group"
                  >
                    <label
                      htmlFor="email"
                      className="block text-xs text-white/60 transition-colors duration-300 group-focus-within:text-[#58eee0] sm:text-sm md:text-base"
                    >
                      Email Address *
                    </label>

                    <input
                      id="email"
                      type="email"
                      className="mt-2 w-full border-b border-white/10 bg-transparent pb-2.5 text-sm text-white transition-all duration-300 outline-none focus:border-[#1E8A8A] sm:mt-3 sm:pb-3 md:pb-4"
                    />
                  </div>

                  {/* Phone */}
                  <div
                    data-wow-duration="0.8s"
                    data-wow-delay="0.25s"
                    className="wow animate__animated animate__fadeInUp group"
                  >
                    <label
                      htmlFor="phone"
                      className="block text-xs text-white/60 transition-colors duration-300 group-focus-within:text-[#58eee0] sm:text-sm md:text-base"
                    >
                      Phone number *
                    </label>

                    <input
                      id="phone"
                      type="tel"
                      className="mt-2 w-full border-b border-white/10 bg-transparent pb-2.5 text-sm text-white transition-all duration-300 outline-none focus:border-[#1E8A8A] sm:mt-3 sm:pb-3 md:pb-4"
                    />
                  </div>

                  {/* Service */}
                  <div
                    data-wow-duration="0.8s"
                    data-wow-delay="0.3s"
                    className="wow animate__animated animate__fadeInUp group relative"
                  >
                    <label
                      htmlFor="service"
                      className="block text-xs text-white/60 transition-colors duration-300 group-focus-within:text-[#58eee0] sm:text-sm md:text-base"
                    >
                      Choose a service
                    </label>

                    <select
                      id="service"
                      defaultValue=""
                      className="mt-2 w-full appearance-none border-b border-white/10 bg-transparent pr-7 pb-2.5 text-sm text-white transition-all duration-300 outline-none focus:border-[#1E8A8A] sm:mt-3 sm:pb-3 md:pb-4"
                    >
                      <option
                        value=""
                        disabled
                        className="bg-[#22363a] text-white"
                      >
                        Choose an option
                      </option>

                      <option value="web" className="bg-[#22363a]">
                        Web Development
                      </option>

                      <option value="design" className="bg-[#22363a]">
                        UI / UX Design
                      </option>

                      <option value="marketing" className="bg-[#22363a]">
                        Digital Marketing
                      </option>
                    </select>

                    <ChevronDown
                      size={17}
                      className="pointer-events-none absolute right-0 bottom-2.5 text-white sm:bottom-3 md:bottom-4"
                    />
                  </div>

                  {/* Message */}
                  <div
                    data-wow-duration="0.8s"
                    data-wow-delay="0.35s"
                    className="wow animate__animated animate__fadeInUp group sm:col-span-2"
                  >
                    <label
                      htmlFor="message"
                      className="block text-xs text-white/60 transition-colors duration-300 group-focus-within:text-[#58eee0] sm:text-sm md:text-base"
                    >
                      Type message *
                    </label>

                    <textarea
                      id="message"
                      rows={3}
                      className="mt-2 w-full resize-none border-b border-white/10 bg-transparent pb-2.5 text-sm text-white transition-all duration-300 outline-none focus:border-[#1E8A8A] sm:mt-3 sm:pb-3 md:pb-4"
                    />
                  </div>
                </div>

                {/* Button */}
                <button
                  data-wow-duration="0.8s"
                  data-wow-delay="0.45s"
                  type="submit"
                  className="wow animate__animated animate__fadeInUp group/button mt-7 flex h-12 w-full max-w-[190px] cursor-pointer items-center justify-between overflow-hidden rounded-full bg-[#1E8A8A] py-1 pr-1 pl-4 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#167575] hover:shadow-xl hover:shadow-[#1E8A8A]/20 sm:mt-8 sm:h-13 sm:text-sm"
                >
                  <span className="overflow-hidden leading-none">
                    <span className="block transition-transform duration-400 [text-shadow:0_30px_0_currentColor] group-hover/button:-translate-y-7.5">
                      Send Message
                    </span>
                  </span>

                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0C1E21] sm:h-11 sm:w-11">
                    <ArrowRight
                      size={17}
                      className="-rotate-45 transition-transform duration-300 group-hover/button:rotate-0 sm:size-[18px]"
                    />
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
