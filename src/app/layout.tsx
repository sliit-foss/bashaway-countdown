import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Bashaway Countdown",
  description: "Real-time countdown timer for Bashaway - SLIIT FOSS",
  keywords: ["bashaway", "sliit", "foss", "countdown", "hackathon", "coding"],
  authors: [{ name: "SLIIT FOSS" }],
  openGraph: {
    title: "Bashaway Countdown",
    description: "Real-time countdown timer for Bashaway - SLIIT FOSS",
    type: "website",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${spaceMono.variable} antialiased bg-gray-950`}
      >
        {children}
      </body>
    </html>
  );
}
