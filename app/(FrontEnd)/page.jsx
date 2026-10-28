"use client";

import Section from "@/app/(FrontEnd)/Home/Section";
import SectionThree from "@/app/(FrontEnd)/Home/SectionThree";
import SectionTwo from "@/app/(FrontEnd)/Home/SectionTwo";
import { useEffect, useState } from "react";
import Loader from "../Components/Loader";
import SectionEight from "./Home/SectionEight";
import SectionEleven from "./Home/SectionEleven";
import SectionFive from "./Home/SectionFive";
import SectionFour from "./Home/SectionFour";
import SectionNine from "./Home/SectionNine";
import SectionSeven from "./Home/SectionSeven";
import SectionSix from "./Home/SectionSix";
import SectionTen from "./Home/SectionTen";

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
