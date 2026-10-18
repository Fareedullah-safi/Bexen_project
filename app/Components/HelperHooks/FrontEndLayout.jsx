"use client";

import { usePathname } from "next/navigation";
import { NavBar } from "@/app/Components/NavBar";
import Footer from "@/app/Components/Footer";
import SectionTwelve from "@/app/Components/SectionTwelve";

export default function FrontEndLayout({ children }) {
  const pathname = usePathname();
  const hideLayout =
    pathname === "/adminLogin" || pathname.startsWith("/adminLogin");

  return (
    <>
      {!hideLayout && <NavBar />}
      <main>{children}</main>
      {!hideLayout && <SectionTwelve />}
      {!hideLayout && <Footer />}
    </>
  );
}
