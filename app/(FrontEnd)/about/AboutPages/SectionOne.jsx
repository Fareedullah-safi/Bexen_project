import ChooseTheBestBtn from "@/app/Components/ChooseTheBestBtn";
import DedicatedBoxes from "@/app/Components/DedicatedBoxes";
import { ArrowRight } from "lucide-react";

export default function SectionOne() {
  return (
    <section className="px-6 py-20 lg:px-18">
      <ChooseTheBestBtn />

      <div className="flex flex-col items-start justify-between gap-8 py-6 lg:flex-row lg:items-end">
        <h1
          data-wow-duration="0.9s"
          data-wow-delay="0.1s"
          className="wow animate__animated animate__fadeInLeft max-w-3xl text-4xl leading-tight font-medium text-[#102326] sm:text-5xl lg:text-5xl"
        >
          Empowering Business <br />
          <span className="text-[#1E8A8A]">with Expertise.</span>
        </h1>

        <button
          type="button"
          data-wow-duration="0.8s"
          data-wow-delay="0.35s"
          className="wow animate__animated animate__fadeInRight group/button flex h-14 w-48 shrink-0 cursor-pointer items-center justify-between gap-1 overflow-hidden rounded-full bg-[#1E8A8A] py-1 pr-1 pl-5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#167575]"
        >
          <span className="overflow-hidden leading-none">
            <span className="block transition-transform duration-400 [text-shadow:0_30px_0_currentColor] group-hover/button:-translate-y-7.5">
              Request a Call
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

      {/* DedicatedBoxes - let it size itself naturally */}
      <div className="mt-8">
        <DedicatedBoxes />
      </div>
    </section>
  );
}
