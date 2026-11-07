import FrontEndLayout from "@/app/Components/HelperHooks/FrontEndLayout";
import WowAnimation from "@/app/Components/WowAnimation";
import "@/app/globals.css";
import { Mona_Sans, Noto_Sans_Arabic } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";

const monaSans = Mona_Sans({
  subsets: ["latin"],
  variable: "--font-mona",
  display: "swap",
});

const arabicFont = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata = {
  title: "Bexon - Corporate Business",
  description: "Corporate Business Website",
  icons: {
    icon: "/project-logo.jpg?v=1",
    shortcut: "/project-logo.jpg?v=1",
    apple: "/project-logo.jpg?v=1",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/project-logo.jpg?v=1" sizes="any" />
      </head>

      <body
        className={`${monaSans.variable} ${arabicFont.variable}`}
        suppressHydrationWarning
      >
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

        <FrontEndLayout>{children}</FrontEndLayout>

        <Toaster position="top-right" richColors closeButton duration={3000} />
      </body>
    </html>
  );
}
