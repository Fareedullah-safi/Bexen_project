import { Box } from "lucide-react";

export default function ChooseTheBestBtn() {
  return (
    <>
      <span
        className="wow animate__animated animate__fadeIn group inline-flex items-center gap-2 border border-cyan-100 bg-cyan-50/30 px-3 py-1.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:bg-cyan-100 hover:shadow-md sm:px-4"
        data-wow-duration="0.8s"
      >
        <Box
          size={18}
          className="text-[#1E8A8A] transition-transform duration-300 group-hover:rotate-180"
        />

        <h3 className="sm:text-md text-sm font-bold tracking-wide text-zinc-950">
          CHOOSE THE BEST
        </h3>
      </span>
    </>
  );
}
