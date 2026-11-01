"use client";

import { usePathname } from "next/navigation";

// Check if Navbar/Footer are exported as default OR  named imports in your project
import FooterComponent from "../Footer"; // Default import
import NavbarComponent from "../Navbar"; // Default import

export default function FrontEndLayout({ children }) {
  const pathname = usePathname();

  // Hide Navbar & Footer on all Admin pages (/admin, /admin/dashboard, etc.)
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <main>{children}</main>;
  }

  // Safe checks in case NavbarComponent or FooterComponent are named exports or missing
  const Navbar = NavbarComponent?.default || NavbarComponent;
  const Footer = FooterComponent?.default || FooterComponent;

  return (
    <>
      {Navbar && typeof Navbar === "function" ? <Navbar /> : null}
      <main>{children}</main>
      {Footer && typeof Footer === "function" ? <Footer /> : null}
    </>
  );
}
