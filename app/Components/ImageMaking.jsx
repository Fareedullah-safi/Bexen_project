import Image from "next/image";
import Button from "./Button";
import { PhoneCallIcon } from "lucide-react";

export default function ImageMaking() {
  return (
    <main className="relative z-0 m-2 h-[77vh] w-90 overflow-hidden rounded-2xl bg-zinc-900">
      <div className="p-6 pt-8">
        <h1 className="text-5xl font-semibold text-gray-200">Modern</h1>

        <h2 className="pt-3 text-2xl font-semibold text-gray-300">Home Makeover</h2>

        <button className="mt-6 flex h-9 w-50 items-center justify-center gap-3 rounded-full bg-[#1E8A8A] text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-[#167272]">
          <PhoneCallIcon size={20} />
          +1 (832) 189-0640
        </button>

        <div className="absolute bottom-0 left-20 top-60 h-60 w-60 overflow-hidden rounded-full border-6 border-cyan-800">
          <Image
            src="https://themejunction.net/html/bexon/demo/assets/images/service/service-ad.webp"
            alt="Modern Home Makeover"
            fill
            className="object-cover"
            sizes="240px"
          />
        </div>
      </div>
    </main>
  );
}
