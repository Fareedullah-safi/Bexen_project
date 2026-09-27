"use client";
import { NavBar } from "./Home/NavBar";
import Section from "./Home/Section";
import SectionFive from "./Home/SectionFive";
import SectionFour from "./Home/SectionFour";
import SectionSix from "./Home/SectionSix";
import SectionThree from "./Home/SectionThree";
import SectionTwo from "./Home/SectionTwo";

export default function HomePage() {
  return (
    <>
      <NavBar />
      <Section />
      <SectionTwo />
      <SectionThree />
      <SectionFour />
      <SectionFive />
      <SectionSix />
    </>
  );
}
