import type React from "react";
import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["400", "600", "700", "900"],
});

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "SocialFlow - Social Media Management Platform",
  description: "Professional social media management platform for Instagram and Facebook",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // <ClerkProvider>
      <html lang="en" className={`${montserrat.variable} ${openSans.variable} antialiased`}>
        <body className="font-sans" suppressHydrationWarning={true}>
          {children}
        </body>
      </html>

  );
}
