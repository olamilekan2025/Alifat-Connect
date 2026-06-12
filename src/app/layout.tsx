import type { Metadata } from "next";
import Script from "next/script";
import { Montserrat } from "next/font/google";

import "./globals.css";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Providers from "@/components/provider/providers";
import ToasterProvider from "@/app/providers/toaster-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
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
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={montserrat.variable}
      data-scroll-behavior="smooth"
    >
      <body
        className="
          min-h-screen
          bg-white
          font-sans
          text-zinc-900
          antialiased
          dark:bg-black
          dark:text-white
        "
      >
        {/* Paystack */}
        <Script
          src="https://js.paystack.co/v1/inline.js"
          strategy="beforeInteractive"
        />

        {/* Tawk Live Chat */}
        {process.env.NODE_ENV === "production" && (
          <Script
            id="tawk-chat"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
        var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
        (function(){
          var s1=document.createElement("script"),
          s0=document.getElementsByTagName("script")[0];
          s1.async=true;
          s1.src='https://embed.tawk.to/6a28bb8d3b75f31c2bcf6a9c/1jqnhp8a0';
          s1.charset='UTF-8';
          s1.setAttribute('crossorigin','*');
          s0.parentNode.insertBefore(s1,s0);
        })();
      `,
            }}
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
