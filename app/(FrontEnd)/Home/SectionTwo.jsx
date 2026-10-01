"use client";

import ChooseTheBestBtn from "@/app/Components/ChooseTheBestBtn";
import DedicatedBoxes from "@/app/Components/DedicatedBoxes";
import { GlobeIcon } from "lucide-react";
import { GiTrophyCup } from "react-icons/gi";
import { GoLightBulb } from "react-icons/go";
import { MdSupportAgent } from "react-icons/md";

export default function SectionTwoSectionTwo() {
  return (
    <section className="w-full">
      <main className="px-4 py-12 sm:px-6 lg:px-12">
        {/* Heading Badge */}
        <div className="flex justify-center">
          <ChooseTheBestBtn />
        </div>
        {/* Main Heading */}
        <h1
          className="wow animate__animated animate__fadeInUp pt-6 pb-8 text-center text-4xl leading-tight font-medium text-gray-700 sm:text-5xl"
          data-wow-duration="1s"
          data-wow-delay="0.2s"
        >
          Empowering Business
          <br />
          with <span className="text-[#1E8A8A]">Expertise.</span>
        </h1>
        {/* boxes */}
        <DedicatedBoxes />
      </main>
    </section>
  );
}
