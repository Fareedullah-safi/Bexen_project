"use client";

import { usePathname } from "next/navigation";

// Absolute imports using '@' alias (avoids relative path issues)
import Footer from "@/app/Components/Footer";
import { NavBar } from "../NavBar";
import SectionTwelve from "../SectionTwelve";

export default function FrontEndLayout({ children }) {
  const pathname = usePathname();

  // Hide Navbar & Footer ONLY on admin routes (/admin, /admin/dashboard, etc.)
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <main>{children}</main>;
  }

  return (
    <>
      <NavBar />
      <main>{children}</main>
      <SectionTwelve />
      <Footer />
    </>
  );
}
