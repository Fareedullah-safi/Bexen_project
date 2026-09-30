import About from "./AboutPages/About";
import SectionOne from "./AboutPages/SectionOne";
import SectionTwo from "./AboutPages/SectionTwo";

export default function AboutPage() {
  return (
    <main className="pt-12 bg-green-300 h-900">
      <About />
      <SectionOne />
      <SectionTwo />
    </main>
  );
}
