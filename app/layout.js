import { Mona_Sans } from "next/font/google";
import "./globals.css";
import WowAnimation from "./Components/WowAnimation";

const monaSans = Mona_Sans({
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={monaSans.className}>
        <WowAnimation />
        {children}</body>
    </html>
  );
}
