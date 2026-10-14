"use client";

import { useEffect, useState } from "react";
import Section from "./Home/Section";
import SectionTwo from "./Home/SectionTwo";
import SectionThree from "./Home/SectionThree";
import SectionFour from "./Home/SectionFour";
import SectionFive from "./Home/SectionFive";
import SectionSix from "./Home/SectionSix";
import SectionSeven from "./Home/SectionSeven";
import SectionEight from "./Home/SectionEight";
import SectionNine from "./Home/SectionNine";
import SectionTen from "./Home/SectionTen";
import Loader from "@/app/Components/Loader";
import { NavBar } from "../Components/NavBar";
import Footer from "../Components/Footer";
import SectionEleven from "../Components/SectionTwelve";
import SectionTwelve from "../Components/SectionTwelve";

export default function HomePage() {
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
      <NavBar />
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
      <SectionTwelve />
      <Footer />
    </main>
  );
}
