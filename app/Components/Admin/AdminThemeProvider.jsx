"use client";

import { ThemeProvider } from "next-themes";

export default function AdminThemeProvider({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="universal-admin-theme"
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}