"use client";

import { usePathname } from "next/navigation";
import { NavBar } from "@/app/Components/NavBar";
import SectionTwelve from "@/app/Components/SectionTwelve";
import Footer from "@/app/Components/Footer";

export default function ConditionalLayout() {
  const pathname = usePathname();
  const hideLayout = pathname === "/adminLogin";

  if (hideLayout) return null;

  return (
    <>
      <NavBar />
      <SectionTwelve />
      <Footer />
    </>
  );
}
