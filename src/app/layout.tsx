import type { Metadata } from "next";
import Script from "next/script";
import { cache } from "react";
import { Montserrat } from "next/font/google";

import "./globals.css";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Providers from "@/components/provider/providers";
import ToasterProvider from "@/app/providers/toaster-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import FaviconUpdater from "@/components/FaviconUpdater";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const getBrandingSettings = cache(async () => {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/admin/settings`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return "/favicon.ico";
    }

    const data = await res.json();

    return data?.settings?.branding?.faviconUrl || "/favicon.ico";
  } catch (error) {
    console.error("Failed to load branding settings:", error);
    return "/favicon.ico";
  }
});

export async function generateMetadata(): Promise<Metadata> {
  const favicon = await getBrandingSettings();

  return {
    title: {
      default: "Alifat Connect",
      template: "%s | Alifat Connect",
    },
    description:
      "Fast and reliable platform for data, airtime, utility bills, TV subscriptions, and more.",
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const favicon = await getBrandingSettings();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={montserrat.variable}
    >
      <body
        className="
          min-h-screen
          bg-white
          text-zinc-900
          antialiased
          dark:bg-black
          dark:text-white
        "
      >
        <FaviconUpdater url={favicon} />

        <Script
          id="theme-script"
          strategy="beforeInteractive"
        >{`try {
          const theme = localStorage.getItem('theme');
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          const resolvedTheme = theme || systemTheme;
          document.documentElement.classList.add(resolvedTheme);
        } catch (e) {}`}</Script>

        <Script
          id="paystack-inline"
          src="https://js.paystack.co/v1/inline.js"
          strategy="afterInteractive"
        />

        {process.env.NODE_ENV === "production" && (
          <Script
            id="tawk-chat"
            src="https://embed.tawk.to/6a28bb8d3b75f31c2bcf6a9c/1jqnhp8a0"
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        )}

        <Providers>
          <TooltipProvider delayDuration={0}>
            <ToasterProvider />

            <div className="relative flex min-h-screen flex-col">
              <Navbar />

              <main className="flex-1">{children}</main>

              <Footer />
            </div>
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}

