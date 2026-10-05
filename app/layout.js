import { Mona_Sans } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import WowAnimation from "./Components/WowAnimation";

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

        {children}

        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={3000}
        />
      </body>
    </html>
  );
}