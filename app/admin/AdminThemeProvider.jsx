"use client";

import { ThemeProvider } from "next-themes";

export default function AdminThemeProvider({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="universal-admin-theme"
    >
      {children}
    </ThemeProvider>
  );
}
