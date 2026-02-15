import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KI-Verhandlungsassistent",
  description: "KI-gestützter Verhandlungsassistent für den Einkauf – Powered by Claude AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
