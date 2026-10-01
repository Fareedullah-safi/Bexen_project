import SectionFour from "./AboutPages/SectionFour";
import SectionThree from "../Home/SectionThree";
import About from "./AboutPages/About";
import SectionOne from "./AboutPages/SectionOne";
import SectionTwo from "./AboutPages/SectionTwo";

export default function AboutPage() {
  return (
    <main className="pt-12">
      <About />
      <SectionOne />
      <SectionTwo />
      <SectionThree />
      <SectionFour />
    </main>
  );
}
