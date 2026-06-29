

"use client";

import Link from "next/link";

import {
  Menu,
  X,
} from "lucide-react";

import { usePathname } from "next/navigation";

import {
  useState,
  useEffect,
} from "react";

const navLinks = [
 

  {
    href: "/about",
    label: "About",
  },

  {
    href: "/price",
    label: "Pricing",
  },

  {
    href: "/testimonials",
    label: "Testimonials",
  },

  {
    href: "/FAQ",
    label: "FAQ",
  },
];

export default function Navbar() {
  const pathname =
    usePathname();

  const [isOpen, setIsOpen] =
    useState(false);

    const [branding, setBranding] = useState({
  platformName: "Alifat Connect",
  logoUrl: "",
});

  // Hide navbar on auth/dashboard pages
  const hideNavbar = [
    "/auth/login",
    "/auth/reset-password",
    "/auth/verify-email",
    "/auth/verify-login",
    "/auth/forgot-password",
    "/auth/signup",
  ].includes(pathname)
    || pathname.startsWith(
      "/dashboard",
    ) || pathname.startsWith("/admin-dashboard"
    );

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow =
      isOpen
        ? "hidden"
        : "auto";

    return () => {
      document.body.style.overflow =
        "auto";
    };
  }, [isOpen]);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);



  useEffect(() => {
  async function loadBranding() {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();

      if (data?.success && data?.settings) {
        setBranding({
          platformName:
            data.settings.platformName || "Alifat Connect",
          logoUrl:
            data.settings.branding?.logoUrl || "",
        });
      }
    } catch (error) {
      console.error("Failed to load branding", error);
    }
  }

  loadBranding();
}, []);

  if (hideNavbar) {
    return null;
  }

  const isActive = (
    href: string,
  ) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(
      href,
    );
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
<nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-white/80 backdrop-blur-2xl dark:bg-black/80">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            onClick={closeMenu}
            className="flex items-center gap-3"
          >
            {branding.logoUrl ? (
  <img
    src={branding.logoUrl}
    alt={branding.platformName}
    className="h-10 w-10 rounded-full object-cover border-4 border-[#D4AF37]"
  />
) : (
  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37] font-bold text-black shadow-lg shadow-[#D4AF37]/25">
    {branding.platformName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()}
  </div>
)}

<span className="text-xl font-bold text-gray-900 dark:text-white">
  {branding.platformName}
</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map(
              (link) => (
                <Link
                  key={
                    link.href
                  }
                  href={
                    link.href
                  }
                  className={`text-sm font-medium transition-colors ${
                    isActive(
                      link.href,
                    )
                      ? "text-[#D4AF37]"
                      : "text-gray-700 hover:text-[#D4AF37] dark:text-gray-300 dark:hover:text-[#D4AF37]"
                  }`}
                >
                  {
                    link.label
                  }
                </Link>
              ),
            )}
          </div>

          {/* Desktop Right */}
          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-[#D4AF37] dark:text-gray-300 dark:hover:text-[#D4AF37]"
            >
              Login
            </Link>

            <Link
              href="/auth/signup"
              className="rounded-full border-3 border-[#D4AF37] px-5 py-2 text-sm font-semibold text-black dark:text-white dark:hover:text-black transition-all duration-300 hover:scale-105 hover:bg-white"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() =>
                setIsOpen(
                  (
                    prev,
                  ) => !prev,
                )
              }
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-900 transition-colors hover:bg-gray-100 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="border-t h-screen border-gray-200 px-2 py-6 dark:border-white/10 md:hidden ">
            <div className="flex flex-col gap-5">
              {navLinks.map(
                (link) => (
                  <Link
                    key={
                      link.href
                    }
                    href={
                      link.href
                    }
                    onClick={
                      closeMenu
                    }
                    className={`text-sm font-medium transition-colors ${
                      isActive(
                        link.href,
                      )
                        ? "text-[#D4AF37]"
                        : "text-gray-700 hover:text-[#D4AF37] dark:text-gray-300 dark:hover:text-[#D4AF37]"
                    }`}
                  >
                    {
                      link.label
                    }
                  </Link>
                ),
              )}

              <div className="mt-4 flex flex-col gap-3 border-t border-gray-200 pt-4 dark:border-white/10">
                <Link
                  href="/auth/login"
                  onClick={
                    closeMenu
                  }
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-[#D4AF37] dark:text-gray-300 dark:hover:text-[#D4AF37]"
                >
                  Login
                </Link>

                <Link
                  href="/auth/signup"
                  onClick={
                    closeMenu
                  }
                  className="rounded-full bg-[#D4AF37] px-5 py-3 text-center text-sm font-semibold text-black transition-all duration-300 hover:bg-[#E6C55A]"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}