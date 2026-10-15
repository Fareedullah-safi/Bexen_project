"use client";

import { useEffect, useState } from "react";
import Section from "@/app/(FrontEnd)/Home/Section";
import SectionThree from "@/app/(FrontEnd)/Home/SectionThree";
import SectionFour from "@/app/(FrontEnd)/Home/SectionFour";
import SectionFive from "@/app/(FrontEnd)/Home/SectionFive";
import SectionSix from "@/app/(FrontEnd)/Home/SectionSix";
import SectionSeven from "@/app/(FrontEnd)/Home/SectionSeven";
import SectionEight from "@/app/(FrontEnd)/Home/SectionEight";
import SectionNine from "@/app/(FrontEnd)/Home/SectionNine";
import SectionTen from "@/app/(FrontEnd)/Home/SectionTen";
import SectionEleven from "./Home/SectionEleven";
import Loader from "../Components/Loader";
import SectionTwo from "./about/AboutPages/SectionTwo";

export default function Page() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const apis = [
        "/api/homepage/slides",
        "/api/homepage/about-us",
        "/api/homepage/articles-section",
        "/api/homepage/brand-logos",
        "/api/homepage/faq",
        "/api/homepage/features",
        "/api/homepage/projects",
        "/api/homepage/reviews-section",
        "/api/homepage/services",
        // Add your other 11 actual API paths here
      ];

      try {
        await Promise.allSettled(
          apis.map((url) => fetch(url, { cache: "no-store" })),
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) return <Loader />;

  return (
    <main className="overflow-x-hidden">
      <Section />
      <SectionTwo />
      <SectionThree />
      <SectionFour />
      <SectionFive />
      <SectionSix />
      <SectionSeven />
      <SectionEight />
      <SectionNine />
      <SectionTen />
      <SectionEleven />
    </main>
  );
}
