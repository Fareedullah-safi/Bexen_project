import Button from "@/app/Components/Button";
import { ArrowRight, Box } from "lucide-react";
import Image from "next/image";

export default function SectionEleven() {
  const blogs = [
    {
      image:
        "https://themejunction.net/html/bexon/demo/assets/images/blog/blog-1.webp",
      category: "Business",
      author: "Ellinien Loma",
      lines: ["Innovative Solutions", "for every Business", "Success."],
    },
    {
      image:
        "https://themejunction.net/html/bexon/demo/assets/images/blog/blog-2.webp",
      category: "Business",
      author: "Ellinien Loma",
      lines: ["Harnessing Digital", "Roadmap Transform", "a Businesses."],
    },
    {
      image:
        "https://themejunction.net/html/bexon/demo/assets/images/blog/blog-3.webp",
      category: "Business",
      author: "Ellinien Loma",
      lines: ["Mastering Change", "Management Lessons", "for Businesses."],
    },
  ];

  return (
    <section className="w-full bg-[#ECF0F0] px-4 py-16 sm:px-6 md:px-8 lg:px-12">
      <div className="w-full">
        <span className="wow animate__animated animate__fadeInDown mx-auto flex w-fit items-center gap-2 rounded-md border border-[#1E8A8A]/20 bg-white/40 px-4 py-2 text-xs font-bold tracking-wide text-[#102326]">
          <Box size={17} className="text-[#1E8A8A]" />
          INSIGHT & IDEAS
        </span>

        <h1 className="wow animate__animated animate__fadeInUp mt-4 text-center text-3xl leading-tight font-medium text-[#102326] sm:text-4xl md:text-5xl lg:text-6xl">
          The Ultimate <span className="text-[#1E8A8A]">Resource.</span>
        </h1>

        <div className="mt-10 grid w-full gap-5 sm:mt-12 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-3">
          {blogs.map((blog, index) => (
            <div
              key={index}
              data-wow-delay={`${index * 0.15}s`}
              className="wow animate__animated animate__fadeInUp overflow-hidden rounded-2xl bg-white"
            >
              {/* Image */}
              <div className="relative h-56 w-full overflow-hidden sm:h-64 md:h-72">
                <Image
                  src={blog.image}
                  width={888}
                  height={888}
                  alt={blog.lines[0]}
                  className="h-full w-full object-cover transition duration-700 hover:scale-105"
                />

                <div className="absolute top-4 left-4 z-10 flex h-20 w-20 items-center justify-center rounded-lg border border-black/10 bg-black/10 px-4 py-3 shadow-lg backdrop-blur-md">
                  <span className="leading-light text-sm font-semibold text-white">
                    <span className="text-2xl">28</span>
                    <br />
                    FEB
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="px-5 py-6 sm:px-6 sm:py-7">
                {/* Meta */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="rounded-md border border-zinc-300 px-3 py-1 text-base font-medium text-[#102326] sm:text-lg">
                    {blog.category}
                  </span>

                  <span className="text-base text-zinc-500 sm:text-lg">By</span>

                  <span className="text-base text-[#102326] sm:text-lg">
                    {blog.author}
                  </span>
                </div>

                {/* Title */}
                <div className="group/title mt-6">
                  {blog.lines.map((line, lineIndex) => (
                    <div
                      key={lineIndex}
                      className="relative w-fit cursor-pointer text-2xl leading-8 font-semibold text-[#102326] sm:text-2xl md:text-[23.3px]"
                    >
                      <span>{line}</span>

                      <span className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-[#102326] transition-transform duration-900 ease-out group-hover/title:scale-x-100" />

                      {lineIndex !== blog.lines.length - 1 && <br />}
                    </div>
                  ))}
                </div>

                {/* Read More */}
                <button
                  type="button"
                  className="group/read mt-7 inline-flex w-full max-w-44 cursor-pointer items-center justify-between gap-2 overflow-hidden rounded-full bg-white py-1 pr-1 pl-4 text-sm font-semibold text-[#0C1E21] transition-all duration-300 hover:shadow-md sm:text-base"
                >
                  <span className="overflow-hidden leading-none">
                    <span className="block transition-transform duration-400 ease-in-out [text-shadow:0_30px_0_currentColor] group-hover/read:-translate-y-7.5">
                      Read More
                    </span>
                  </span>

                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0C1E21] group-hover/read:bg-[#1E8A8A] sm:h-10 sm:w-10">
                    <ArrowRight
                      size={18}
                      className="-rotate-45 text-white transition-transform duration-300 ease-in-out group-hover/read:rotate-0 sm:size-5"
                    />
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
