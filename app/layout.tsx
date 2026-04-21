import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../src/tailwind.input.css";
import "../src/index.css";

const themeInitScript = `
  (function () {
    try {
      var storedTheme = window.localStorage.getItem("synosys-theme");
      var theme = storedTheme === "light" || storedTheme === "dark" || storedTheme === "system"
        ? storedTheme
        : "system";
      var systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      var resolvedTheme = theme === "system" ? systemTheme : theme;
      var root = document.documentElement;

      root.classList.toggle("dark", resolvedTheme === "dark");
      root.dataset.theme = theme;
      root.style.colorScheme = resolvedTheme;
    } catch (error) {
      console.error("Failed to initialize theme", error);
    }
  })();
`;

export const metadata: Metadata = {
  title: "SynoSys Platform",
  description: "Internal campaign, creative, and lead workflow platform.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      </body>
    </html>
  );
}
