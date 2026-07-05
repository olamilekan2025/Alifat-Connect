"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Send, Mail, Phone, MapPin, Sun, Moon } from "lucide-react";

import { useTheme } from "next-themes";
import { SlSocialFacebook } from "react-icons/sl";
import { BsInstagram } from "react-icons/bs";
import { TfiTwitter } from "react-icons/tfi";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

import { Loader2 } from "lucide-react";

const quickLinks = [
  { name: "About", href: "/about" },
  { name: "Pricing", href: "/price" },
  { name: "Testimonials", href: "/testimonials" },
  { name: "Contact", href: "/contact" },
  { name: "FAQ", href: "/FAQ" },
];

const services = [
  { name: "Data Bundle", href: "/auth/login" },
  { name: "Airtime Topup", href: "/auth/login" },
  { name: "TV Subscription", href: "/auth/login" },
  { name: "Electricity Bills", href: "/auth/login" },
];

const socialLinks = [
  {
    href: "#",
    icon: SlSocialFacebook,
    label: "Facebook",
  },
  {
    href: "#",
    icon: BsInstagram,
    label: "Instagram",
  },
  {
    href: "#",
    icon: TfiTwitter,
    label: "Twitter",
  },
];

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on auth pages
  const hideFooter =
    pathname === "/auth/login" ||
    pathname === "/auth/signup" ||
    pathname === "/auth/reset-password" ||
    pathname === "/auth/verify-email" ||
    pathname === "/auth/verify-login" ||
    pathname === "/dashboard" ||
    pathname === "/dashboard/settings" ||
    pathname === "/dashboard/wallet" ||
    pathname === "/dashboard/airtime" ||
    pathname === "/dashboard/data" ||
    pathname === "/dashboard/education" ||
    pathname === "/dashboard/recharge-card" ||
    pathname === "/dashboard/electricity" ||
    pathname === "/dashboard/subscription" ||
    pathname === "/dashboard/become-seller" ||
    pathname === "/dashboard/recharge-history" ||
    pathname === "/dashboard/manage-wallet" ||
    pathname === "/dashboard/reports" ||
    pathname === "/dashboard/referral" ||
    pathname === "/admin-dashboard" ||
    pathname === "/admin-dashboard/users" ||
    pathname === "/admin-dashboard/transactions" ||
    pathname === "/admin-dashboard/settings" ||
    pathname === "/admin-dashboard/wallet" ||
    pathname === "/admin-dashboard/security" ||
    pathname === "/auth/forgot-password";

  if (hideFooter) return null;

  const [email, setEmail] = useState("");

  const [subscribing, setSubscribing] = useState(false);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [branding, setBranding] = useState({
    footerText: "",
    copyrightText: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadBranding() {
      try {
        const res = await fetch("/api/public/branding");

        if (!res.ok) {
          throw new Error("Failed to fetch settings");
        }

        const data = await res.json();

        setBranding({
          footerText: data?.branding?.footerText ?? "",
          copyrightText: data?.branding?.copyrightText ?? "",
        });
      } catch (error) {
        console.error("Failed to load branding settings:", error);
      }
    }

    loadBranding();
  }, []);

  const handleNewsletterSubscribe = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      toast.error("Enter your email");
      return;
    }

    try {
      setSubscribing(true);

      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("Thanks for subscribing 🎉");

      setEmail("");
    } catch {
      toast.error("Failed to subscribe");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="relative overflow-hidden bg-gray-100 text-white dark:bg-zinc-950">
      {/* Background Glow */}
      {/* <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-[#D4AF37]/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#D4AF37]/10 blur-3xl" /> */}

      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-10 md:px-6  lg:px-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 gap-14 border-b border-white/10 pb-16 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="text-3xl text-black font-extrabold tracking-tight dark:text-white"
            >
              Alifat
              <span className="text-[#D4AF37]"> Connect</span>
            </Link>

            <p className="mt-6 leading-relaxed text-gray-600 dark:text-slate-400">
              {branding.footerText ||
                "Fast, secure, and reliable VTU platform for data, airtime, utility bills, TV subscriptions, and more."}
            </p>

            {/* Social Icons */}
            <div className="mt-8 flex items-center gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;

                return (
                  <Button
                    key={social.label}
                    asChild
                    size="icon"
                    variant="ghost"
                    className="h-11 w-11 rounded-full bg-black text-white hover:bg-[#D4AF37] dark:hover:text-[#D4AF37]"
                  >
                    <Link href={social.href} aria-label={social.label}>
                      <Icon className="h-5 w-5" />
                    </Link>
                  </Button>
                );
              })}
              
              <Button
  size="icon"
  variant="ghost"
  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
  className="h-11 w-11 rounded-full bg-black text-white hover:bg-[#D4AF37] dark:hover:text-[#D4AF37]"
  aria-label="Toggle theme"
>
  {theme === "dark" ? (
    <Sun className="h-5 w-5" />
  ) : (
    <Moon className="h-5 w-5" />
  )}
</Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-6 text-xl font-bold text-black dark:text-white">
              Quick Links
            </h3>

            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-500 transition-colors hover:text-[#D4AF37] dark:text-slate-400"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-6 text-xl font-bold text-black dark:text-white">
              Services
            </h3>

            <ul className="space-y-4">
              {services.map((service) => (
                <li key={service.name}>
                  <Link
                    href={service.href}
                    className="text-gray-500 transition-colors hover:text-[#D4AF37] dark:text-slate-400"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="mb-6 text-xl font-bold text-black dark:text-white">
              Contact Us
            </h3>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <Mail className="mt-1 h-5 w-5 shrink-0 text-[#D4AF37]" />
                <p className="text-gray-500 dark:text-slate-400">
                  support@alifatconnect.com
                </p>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="mt-1 h-5 w-5 shrink-0 text-[#D4AF37]" />
                <p className="text-gray-500 dark:text-slate-400">
                  +234 800 000 0000
                </p>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-[#D4AF37]" />
                <p className="text-gray-500 dark:text-slate-400">
                  Lagos, Nigeria
                </p>
              </div>
            </div>

            {/* Newsletter Card */}
            <Card className="mt-4 border-white/10 bg-white/5 shadow-none backdrop-blur-sm dark:bg-white/5">
              <CardContent className="p-2">
                <form
                  onSubmit={handleNewsletterSubscribe}
                  className="flex items-center gap-2"
                >
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={subscribing}
                    className="border-0 bg-transparent text-white placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />

                  <Button
                    type="submit"
                    size="icon"
                    disabled={subscribing}
                    className="h-9 w-9 shrink-0 rounded-full bg-[#D4AF37] text-black hover:bg-[#E5C158]"
                  >
                    {subscribing ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Send className="h-3 w-3" />
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-between gap-4 pt-8 md:flex-row border-t border-black/10">
          <p className="text-sm text-gray-500 dark:text-slate-500">
            {branding.copyrightText ||
              "© 2026 Alifat Connect. All rights reserved."}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            
            <Link
              href="/privacy-policy"
              className="text-gray-500 transition-colors hover:text-[#D4AF37] dark:text-slate-500"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms"
              className="text-gray-500 transition-colors hover:text-[#D4AF37] dark:text-slate-500"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
