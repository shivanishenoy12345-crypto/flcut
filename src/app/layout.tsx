import type { Metadata } from "next";
//import "./globals.css";

export const metadata: Metadata = {
  title: "FLcut — URL Shortener",
  description: "Shorten. Schedule. Track.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}