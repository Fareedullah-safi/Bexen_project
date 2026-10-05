import { NavBar } from "@/app/Components/NavBar";
import Footer from "@/app/Components/Footer";
import WowAnimation from "@/app/Components/WowAnimation";
import SectionTwelve from "../Components/SectionTwelve";

export default function FrontEndLayout({ children }) {
  return (
    <>
      <WowAnimation />
      <NavBar />
      {children}
      <SectionTwelve />
      <Footer />
    </>
  );
}
