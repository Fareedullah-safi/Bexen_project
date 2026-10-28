import SectionThree from "../Home/SectionThree";
import About from "./AboutPages/About";
import SectionSix from "./AboutPages/SectionSix";
import SectionTwo from "./AboutPages/SectionTwo";

export default function AboutPage() {
  return (
    <main className="overflow-x-hidden pt-12">
      <About />
      {/* <SectionOne /> */}
      <SectionTwo />
      <SectionThree />
      {/* <SectionFour /> */}
      {/* <SectionFive /> */}
      <SectionSix />
    </main>
  );
}
