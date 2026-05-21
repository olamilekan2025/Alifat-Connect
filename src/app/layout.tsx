import type { Metadata } from "next";
import Script from "next/script";

import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import "./globals.css";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

import Providers from "@/components/provider/providers";

import ToasterProvider from "@/app/providers/toaster-provider";

import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Alifat Connect",
    template: "%s | Alifat Connect",
  },

  description:
    "Fast and reliable platform for data, airtime, utility bills, TV subscriptions, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          min-h-screen
          bg-white
          font-sans
          text-zinc-900
          antialiased
          dark:bg-black
          dark:text-white
        `}
      >
        {/* Paystack Inline Script */}
        <Script
          src="https://js.paystack.co/v1/inline.js"
          strategy="beforeInteractive"
        />

        <Providers>
          <TooltipProvider delayDuration={0}>
            <ToasterProvider />

            <div className="relative flex min-h-screen flex-col overflow-hidden">
              <Navbar />

              <main className="flex-1">
                {children}
              </main>

              <Footer />
            </div>
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}