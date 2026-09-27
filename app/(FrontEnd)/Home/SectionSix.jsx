import { ArrowRight, GlobeIcon } from "lucide-react";
import Image from "next/image";

export default function SectionSix() {
  return (
    <section className="w-full h-[200vh] bg-[#ECF0F0] px-6 py-16">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-15">
        {/* Badge */}
        <span
          className="wow animate__animated animate__fadeInDown group inline-flex items-center gap-2 border border-cyan-100 bg-[#ECF0F0] px-3 py-1.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:bg-cyan-100 hover:shadow-md sm:px-4"
          data-wow-duration="0.8s"
          data-wow-delay="0.4s"
        >
          <GlobeIcon
            size={18}
            className="text-[#1E8A8A] transition-transform duration-300 group-hover:rotate-180"
          />

          <span className="text-sm font-bold tracking-wide text-zinc-950">PROUD PROJECTS</span>
        </span>

        {/* Content */}
        <div className="mt-6 grid gap-5 lg:grid-cols-2 lg:items-center lg:gap-10">
          {/* Heading */}
          <h1
            className="wow animate__animated animate__fadeInUp text-3xl font-medium leading-[1.1] text-[#102326] sm:text-4xl md:text-5xl lg:text-[48px]"
            data-wow-duration="1s"
            data-wow-delay="0.5s"
          >
            Breaking Boundaries,
            <br />
            Building
            <span className="text-[#1E8A8A]"> Dreams.</span>
          </h1>

          {/* Paragraph + Button */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between lg:gap-6">
            <p
              className="wow animate__animated animate__fadeInUp max-w-xl text-justify text-sm leading-6 text-zinc-600 sm:text-base md:text-lg"
              data-wow-duration="1s"
              data-wow-delay="0.6s"
            >
              We work closely with our clients to understand their unique needs and craft tailored
              solutions that address challenges.
            </p>

            {/* Button */}
            <div
              className="wow animate__animated animate__fadeInUp shrink-0 -mt-10"
              data-wow-duration="1s"
              data-wow-delay="0.7s"
            >
              <button
                type="button"
                className="group/button inline-flex h-13 w-48 cursor-pointer items-center justify-between overflow-hidden rounded-full bg-[#1E8A8A] py-1 pl-5 pr-1 text-sm font-semibold text-white shadow-lg shadow-[#1E8A8A]/20 transition-all duration-300 hover:-translate-y-1 hover:bg-[#167575] hover:shadow-xl hover:shadow-[#1E8A8A]/30"
              >
                <span className="overflow-hidden leading-none">
                  <span className="block transition-transform duration-400 ease-in-out [text-shadow:0_30px_0_currentColor] group-hover/button:-translate-y-7.5">
                    More Projects
                  </span>
                </span>

                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0C1E21]">
                  <ArrowRight
                    size={18}
                    className="-rotate-45 text-white transition-transform duration-300 group-hover/button:rotate-0"
                  />
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="mt-10 w-full bg-[#102326]/10" />
      </div>
      {/* Image Section */}
      <div className="mt-10 flex w-full px-14">
        <div className="flex w-full gap-6">
          <div className="relative w-185 h-120 overflow-hidden rounded-2xl">
            <Image
              src="https://themejunction.net/html/bexon/demo/assets/images/project/project-1.webp"
              alt="company image"
              width={999}
              height={666}
              className="h-full w-full object-cover"
            />

            <p className="absolute bottom-5 left-5 z-10 text-lg font-medium text-white">
              Project Description 1
            </p>
          </div>

          <div className="relative w-105 h-115 overflow-hidden rounded-2xl">
            <Image
              src="https://themejunction.net/html/bexon/demo/assets/images/project/project-2.webp"
              alt="company image"
              width={999}
              height={666}
              className="h-full w-full object-cover"
            />

            <p className="absolute bottom-5 left-5 z-10 text-lg font-medium text-white">
              Project Description 2
            </p>
          </div>
        </div>
      </div>
      {/* Image Section closed */}
      {/* Image Section */}
      <div className="mt-10 pt-30 flex px-14 w-full h-80">
        <div className="flex gap-6">
          <Image
            src="https://themejunction.net/html/bexon/demo/assets/images/project/project-3.webp"
            alt="company image"
            width={999}
            height={666}
            className="w-105 h-115 rounded-2xl"
          />
          <Image
            src="https://themejunction.net/html/bexon/demo/assets/images/project/project-4.webp"
            alt="company image"
            width={999}
            height={666}
            className="w-185 h-115 rounded-2xl"
          />
        </div>
      </div>
      {/* Image Section closed */}
    </section>
  );
}
