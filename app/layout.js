import { Mona_Sans } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import WowAnimation from "./Components/WowAnimation";
import SectionTwelve from "./Components/SectionTwelve";
import Footer from "./Components/Footer";
import { NavBar } from "./Components/NavBar";

const monaSans = Mona_Sans({
  subsets: ["latin"],
});

export const metadata = {
  title: "Bexon - Corporate Business",
  description: "Corporate Business Website",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={monaSans.className} suppressHydrationWarning>
        {/* Top Route Progress Loader */}
        <NextTopLoader
          color="#1D8B8A"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #1D8B8A, 0 0 5px #1D8B8A"
        />

        <WowAnimation />
        <NavBar />
        {children}
        <SectionTwelve />
        <Footer />
      </body>
    </html>
  );
}
