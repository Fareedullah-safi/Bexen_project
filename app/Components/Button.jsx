import { ArrowRight } from "lucide-react";

export default function Button() {
  return (
    <div className="pointer-events-none absolute left-3 top-3 z-10 h-52 w-63.5 group-hover/card:pointer-events-auto">
      <div className="absolute inset-0 rounded-md bg-[#0C1E21]/60 opacity-0 transition-opacity duration-400 ease-out group-hover/card:opacity-100" />

      <div className="invisible absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2 opacity-0 transition-all duration-400 ease-out group-hover/card:visible group-hover/card:top-1/2 group-hover/card:opacity-100">
        <button
          type="button"
          className="cursor-pointer group/button inline-flex w-42.5 items-center justify-between gap-2.5 overflow-hidden rounded-full bg-white py-1 pl-4 pr-1 text-base font-semibold text-[#0C1E21]"
        >
          <span className="overflow-hidden leading-none">
            <span className="block [text-shadow:0_30px_0_currentColor] transition-transform duration-400 ease-in-out group-hover/button:-translate-y-7.5">
              View demo
            </span>
          </span>

          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0C1E21]">
            <ArrowRight
              size={20}
              className="-rotate-45 text-white transition-transform duration-300 ease-in-out group-hover/button:rotate-0"
            />
          </span>
        </button>
      </div>
    </div>
  );
}
