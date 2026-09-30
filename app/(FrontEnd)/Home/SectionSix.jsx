import { ArrowRight, Box } from "lucide-react";
import Image from "next/image";

export default function SectionSix() {
  return (
    <section className="w-full bg-[#ECF0F0] px-6 py-16">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-15">
        {/* Badge */}
        <span
          data-wow-duration="0.8s"
          className="wow animate__animated animate__fadeInDown group inline-flex items-center gap-2 border border-cyan-100 bg-[#ECF0F0] px-4 py-2"
        >
          <Box
            size={18}
            className="text-[#1E8A8A] transition-transform duration-500 group-hover:rotate-180"
          />

          <span className="text-sm font-bold text-zinc-950">PROUD PROJECTS</span>
        </span>

        {/* Heading + Content */}
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <h1
            data-wow-duration="0.9s"
            data-wow-delay="0.1s"
            className="wow animate__animated animate__fadeInLeft text-3xl font-medium text-[#102326] sm:text-4xl md:text-5xl lg:text-[48px]"
          >
            Breaking Boundaries,
            <br />
            Building
            <span className="text-[#1E8A8A]"> Dreams.</span>
          </h1>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <p
              data-wow-duration="0.9s"
              data-wow-delay="0.2s"
              className="wow animate__animated animate__fadeInRight max-w-xl flex-1 text-sm leading-6 text-zinc-600 sm:text-base md:text-lg"
            >
              We work closely with our clients to understand their unique needs and craft tailored
              solutions that address challenges.
            </p>

            <button
              type="button"
              data-wow-duration="0.8s"
              data-wow-delay="0.35s"
              className="wow animate__animated animate__fadeInRight group/button flex h-14 w-48 shrink-0 cursor-pointer items-center justify-between gap-1 overflow-hidden rounded-full bg-[#1E8A8A] py-1 pl-5 pr-1 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#167575]"
            >
              <span className="overflow-hidden leading-none">
                <span className="block transition-transform duration-400 [text-shadow:0_30px_0_currentColor] group-hover/button:-translate-y-7.5">
                  More Projects
                </span>
              </span>

              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0C1E21]">
                <ArrowRight
                  size={18}
                  className="-rotate-45 transition-transform duration-300 group-hover/button:rotate-0"
                />
              </span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div
          data-wow-duration="0.8s"
          data-wow-delay="0.4s"
          className="wow animate__animated animate__fadeIn mt-10 h-px w-full bg-[#102326]/10"
        />
      </div>

      {/* Row 1 */}
      <div className="mt-10 w-full px-0 sm:px-6 lg:px-14">
        <div className="flex w-full flex-col gap-6 lg:flex-row">
          {/* Project 1 */}
          <div
            data-wow-duration="0.9s"
            data-wow-delay="0.1s"
            className="wow animate__animated animate__fadeInUp group relative h-120 w-full overflow-hidden rounded-2xl lg:flex-[1.7]"
          >
            <Image
              src="https://themejunction.net/html/bexon/demo/assets/images/project/project-1.webp"
              alt="Event Management Platform"
              width={999}
              height={666}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            <button
              type="button"
              className="absolute bottom-20 left-5 cursor-pointer rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-md transition-all duration-300 hover:bg-[#1E8A8A]"
            >
              Connect
            </button>

            <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
              <button type="button" className="text-left text-2xl font-semibold text-white">
                Event Management
                <br />
                <span>Platform</span>
              </button>

              <button
                type="button"
                aria-label="View Event Management Platform"
                className="group/arrow flex h-15 w-15 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-[#167575]"
              >
                <ArrowRight
                  size={24}
                  className="rotate-320 transition-transform duration-500 group-hover/arrow:rotate-360"
                />
              </button>
            </div>
          </div>

          {/* Project 2 */}
          <div
            data-wow-duration="0.9s"
            data-wow-delay="0.25s"
            className="wow animate__animated animate__fadeInUp group relative h-120 w-full overflow-hidden rounded-2xl lg:flex-1"
          >
            <Image
              src="https://themejunction.net/html/bexon/demo/assets/images/project/project-2.webp"
              alt="Digital Marketing Campaign"
              width={999}
              height={666}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            <button
              type="button"
              className="absolute bottom-20 left-5 cursor-pointer rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-md transition-all duration-300 hover:bg-[#1E8A8A]"
            >
              Empower
            </button>

            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
              <button type="button" className="text-left text-xl font-semibold text-white">
                Digital Marketing
                <br />
                Campaign
              </button>

              <button
                type="button"
                aria-label="View Digital Marketing Campaign"
                className="group/arrow flex h-13 w-13 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-[#167575]"
              >
                <ArrowRight
                  size={22}
                  className="rotate-320 transition-transform duration-500 group-hover/arrow:rotate-360"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="w-full px-0 pt-5 sm:px-6 lg:px-14">
        <div className="flex w-full flex-col gap-6 lg:flex-row">
          {/* Project 3 */}
          <div
            data-wow-duration="0.9s"
            data-wow-delay="0.1s"
            className="wow animate__animated animate__fadeInUp group relative h-115 w-full overflow-hidden rounded-2xl lg:flex-1"
          >
            <Image
              src="https://themejunction.net/html/bexon/demo/assets/images/project/project-3.webp"
              alt="Interactive Learning Platform"
              width={999}
              height={666}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            <button
              type="button"
              className="absolute bottom-20 left-5 cursor-pointer rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-md transition-all duration-300 hover:bg-[#1E8A8A]"
            >
              Support
            </button>

            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
              <button type="button" className="text-left text-xl font-semibold text-white">
                Interactive Learning
                <br />
                Platform
              </button>

              <button
                type="button"
                aria-label="View Interactive Learning Platform"
                className="group/arrow flex h-13 w-13 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-[#167575]"
              >
                <ArrowRight
                  size={22}
                  className="rotate-320 transition-transform duration-500 group-hover/arrow:rotate-360"
                />
              </button>
            </div>
          </div>

          {/* Project 4 */}
          <div
            data-wow-duration="0.9s"
            data-wow-delay="0.25s"
            className="wow animate__animated animate__fadeInUp group relative h-115 w-full overflow-hidden rounded-2xl lg:flex-[1.7]"
          >
            <Image
              src="https://themejunction.net/html/bexon/demo/assets/images/project/project-4.webp"
              alt="Environmental Impact Dashboard"
              width={999}
              height={666}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            <button
              type="button"
              className="absolute bottom-20 left-5 cursor-pointer rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-md transition-all duration-300 hover:bg-[#1E8A8A]"
            >
              Business
            </button>

            <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
              <button type="button" className="text-left text-2xl font-semibold text-white">
                Environmental Impact
                <br />
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                aria-label="View Environmental Impact Dashboard"
                className="group/arrow flex h-15 w-15 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-[#167575]"
              >
                <ArrowRight
                  size={24}
                  className="rotate-320 transition-transform duration-500 group-hover/arrow:rotate-360"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}