

// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useState, useEffect, useRef } from "react";
// import { Menu, X, ChevronDown, LayoutDashboard, LogOut } from "lucide-react";
// import { useSession, signOut } from "next-auth/react";
// import { useRouter } from "next/navigation";

// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";

// import { Button } from "@/components/ui/button";


// const navLinks = [


//   {
//     href: "/about",
//     label: "About",
//   },

//   {
//     href: "/price",
//     label: "Pricing",
//   },

//   {
//     href: "/testimonials",
//     label: "Testimonials",
//   },

//   {
//     href: "/FAQ",
//     label: "FAQ",
//   },
// ];

// export default function Navbar() {
//   const pathname =
//     usePathname();

//   const [isOpen, setIsOpen] =
//     useState(false);

//   const [branding, setBranding] = useState({
//     platformName: "Alifat Connect",
//     logoUrl: "",
//   });

//   const { data: session } = useSession();

//   const isAdmin = session?.user?.role === "admin";

// const dashboardPath = isAdmin
//   ? "/admin-dashboard"
//   : "/dashboard";

//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const [openLogoutModal, setOpenLogoutModal] = useState(false);
//   const router = useRouter();

//   // Hide navbar on auth/dashboard pages
//   const hideNavbar = [
//     "/auth/login",
//     "/auth/reset-password",
//     "/auth/verify-email",
//     "/auth/verify-login",
//     "/auth/forgot-password",
//     "/auth/signup",
//   ].includes(pathname)
//     || pathname.startsWith(
//       "/dashboard",
//     ) || pathname.startsWith("/admin-dashboard"
//     );

//   // Prevent body scroll when mobile menu is open
//   useEffect(() => {
//     document.body.style.overflow =
//       isOpen
//         ? "hidden"
//         : "auto";

//     return () => {
//       document.body.style.overflow =
//         "auto";
//     };
//   }, [isOpen]);

//   // Close menu when route changes
//   useEffect(() => {
//     setIsOpen(false);
//   }, [pathname]);

//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target as Node)
//       ) {
//         setDropdownOpen(false);
//       }
//     }

//     document.addEventListener("mousedown", handleClickOutside);

//     return () =>
//       document.removeEventListener(
//         "mousedown",
//         handleClickOutside
//       );
//   }, []);

//   useEffect(() => {
//     async function loadBranding() {
//       try {
//         const res = await fetch("/api/admin/settings");
//         const data = await res.json();

//         if (data?.success && data?.settings) {
//           setBranding({
//             platformName:
//               data.settings.platformName || "Alifat Connect",
//             logoUrl:
//               data.settings.branding?.logoUrl || "",
//           });
//         }
//       } catch (error) {
//         console.error("Failed to load branding", error);
//       }
//     }

//     loadBranding();
//   }, []);

//   if (hideNavbar) {
//     return null;
//   }

//   const isActive = (
//     href: string,
//   ) => {
//     if (href === "/") {
//       return pathname === "/";
//     }

//     return pathname.startsWith(
//       href,
//     );
//   };

//   const closeMenu = () => {
//     setIsOpen(false);
//   };

//   const handleLogout = async () => {
//     // Close everything first
//     setOpenLogoutModal(false);
//     setDropdownOpen(false);
//     setIsOpen(false);

//     // Give the dialog time to close smoothly
//     await new Promise((resolve) => setTimeout(resolve, 150));

//     await signOut({
//       redirect: false,
//     });

//     router.push("/");
//   };

//   return (
//     <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-white/80 backdrop-blur-2xl dark:bg-black/80">
//       <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
//         <div className="flex h-16 items-center justify-between">
//           {/* Logo */}
//           <Link
//             href="/"
//             onClick={closeMenu}
//             className="flex items-center gap-3"
//           >
//             {branding.logoUrl ? (
//               <img
//                 src={branding.logoUrl}
//                 alt={branding.platformName}
//                 className="h-10 w-10 rounded-full object-cover border-4 border-[#D4AF37]"
//               />
//             ) : (
//               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37] font-bold text-black shadow-lg shadow-[#D4AF37]/25">
//                 {branding.platformName
//                   .split(" ")
//                   .map((word) => word[0])
//                   .join("")
//                   .slice(0, 2)
//                   .toUpperCase()}
//               </div>
//             )}

//             <span className="text-xl font-bold text-gray-900 dark:text-white">
//               {branding.platformName}
//             </span>
//           </Link>

//           {/* Desktop Nav */}
//           <div className="hidden items-center gap-8 md:flex">
//             {navLinks.map(
//               (link) => (
//                 <Link
//                   key={
//                     link.href
//                   }
//                   href={
//                     link.href
//                   }
//                   className={`text-sm font-medium transition-colors ${isActive(
//                     link.href,
//                   )
//                     ? "text-[#D4AF37]"
//                     : "text-gray-700 hover:text-[#D4AF37] dark:text-gray-300 dark:hover:text-[#D4AF37]"
//                     }`}
//                 >
//                   {
//                     link.label
//                   }
//                 </Link>
//               ),
//             )}
//           </div>

//           {session?.user ? (
//             <div
//               ref={dropdownRef}
//               className="relative"
//             >
//               <button
//                 onClick={() =>
//                   setDropdownOpen(!dropdownOpen)
//                 }
//                 className="flex items-center gap-2 rounded-full border border-gray-200 px-2 py-2 transition hover:bg-gray-100 dark:border-white/10 dark:hover:bg-white/10"
//               >
//                 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37] font-bold text-black">
//                   {session.user.name?.charAt(0).toUpperCase()}
//                 </div>

//                 <ChevronDown className="h-4 w-4 text-gray-500" />
//               </button>

//               {dropdownOpen && (
//                 <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-zinc-950">

//                   <div className="border-b border-gray-200 px-4 py-3 dark:border-white/10">
//                     <p className="font-semibold dark:text-white">
//                       {session.user.name}
//                     </p>

//                     <p className="truncate text-xs text-gray-500">
//                       {session.user.email}
//                     </p>
//                   </div>

//                   <Link
//   href={dashboardPath}
//   onClick={() => setDropdownOpen(false)}
//   className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/10"
// >
//   <LayoutDashboard className="h-4 w-4" />
//   Dashboard
// </Link>

//                   <button
//                     onClick={() => {
//                       setDropdownOpen(false);
//                       setOpenLogoutModal(true);
//                     }}
//                     className="flex w-full items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10"
//                   >
//                     <LogOut className="h-4 w-4" />
//                     Logout
//                   </button>
//                 </div>
//               )}
//             </div>
//           ) : (
            
//             <div className="hidden md:flex items-center gap-4">
//               <Link
//                 href="/auth/login"
//                 className="text-sm font-medium text-gray-700 hover:text-[#D4AF37] dark:text-gray-300"
//               >
//                 Login
//               </Link>

//               <Link
//                 href="/auth/signup"
//                 className="rounded-full border-2 border-[#D4AF37] px-5 py-2 font-semibold"
//               >
//                 Sign Up
//               </Link>
            
//             </div>
//           )}

//           {/* Mobile Button */}
//           <div className="flex items-center md:hidden">
//             <button
//               type="button"
//               onClick={() =>
//                 setIsOpen(
//                   (
//                     prev,
//                   ) => !prev,
//                 )
//               }
//               className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-900 transition-colors hover:bg-gray-100 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
//               aria-label="Toggle menu"
//             >
//               {isOpen ? (
//                 <X className="h-5 w-5" />
//               ) : (
//                 <Menu className="h-5 w-5" />
//               )}
//             </button>
//           </div>
//         </div>

//         {/* Mobile Menu */}
//         {isOpen && (
//           <div className="border-t h-screen border-gray-200 px-2 py-6 dark:border-white/10 md:hidden ">
//             <div className="flex flex-col gap-5">
//               {navLinks.map(
//                 (link) => (
//                   <Link
//                     key={
//                       link.href
//                     }
//                     href={
//                       link.href
//                     }
//                     onClick={
//                       closeMenu
//                     }
//                     className={`text-sm font-medium transition-colors ${isActive(
//                       link.href,
//                     )
//                       ? "text-[#D4AF37]"
//                       : "text-gray-700 hover:text-[#D4AF37] dark:text-gray-300 dark:hover:text-[#D4AF37]"
//                       }`}
//                   >
//                     {
//                       link.label
//                     }
//                   </Link>
//                 ),
//               )}

//               {session?.user ? (
//                 <>
//                  <Link
//   href={dashboardPath}
//   onClick={closeMenu}
//   className="text-sm font-medium"
// >
//   Dashboard
// </Link>

//                   <button
//                     onClick={() => setOpenLogoutModal(true)}
//                     className="text-left text-red-500"
//                   >
//                     Logout
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <Link
//                     href="/auth/login"
//                     onClick={closeMenu}
//                   >
//                     Login
//                   </Link>

//                   <Link
//                     href="/auth/signup"
//                     onClick={closeMenu}
//                   >
//                     Sign Up
//                   </Link>
//                 </>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* LOGOUT MODAL */}
//       <Dialog
//   open={openLogoutModal}
//   onOpenChange={(open) => {
//     setOpenLogoutModal(open);

//     if (!open) {
//       setDropdownOpen(false);
//     }
//   }}
// >
//         <DialogContent className="rounded-3xl border border-zinc-200 p-6 shadow-2xl dark:border-zinc-800">
//           <DialogHeader>
//             <DialogTitle className="text-xl font-bold">
//               Logout Account
//             </DialogTitle>

//             <DialogDescription className="pt-2 text-sm text-zinc-500 dark:text-zinc-400">
//               Are you sure you want to logout from your account?
//             </DialogDescription>
//           </DialogHeader>

//           <DialogFooter className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
//             <Button
//               variant="outline"
//               onClick={() => setOpenLogoutModal(false)}
//               className="h-11 w-full rounded-2xl sm:w-auto"
//             >
//               No
//             </Button>

//             <Button
//               onClick={handleLogout}
//               className="h-11 w-full rounded-2xl bg-red-500 text-white hover:bg-red-600 sm:w-auto"
//             >
//               Yes, Logout
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </nav>
//   );
// }





"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  User,
  Loader2,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

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
  const pathname = usePathname();
  const router = useRouter();

  const [isLoggingOut, setIsLoggingOut] =
  useState(false);

  const [isOpen, setIsOpen] = useState(false);

  const [branding, setBranding] = useState({
    platformName: "Alifat Connect",
    logoUrl: "",
  });

  const { data: session } = useSession();

  const isAdmin = session?.user?.role === "admin";

  const dashboardPath = isAdmin
    ? "/admin-dashboard"
    : "/dashboard";

  // Desktop dropdown
  const [dropdownOpen, setDropdownOpen] =
    useState(false);

  // Mobile profile dropdown
  const [mobileProfileOpen, setMobileProfileOpen] =
    useState(false);

  const [openLogoutModal, setOpenLogoutModal] =
    useState(false);

  const dropdownRef =
    useRef<HTMLDivElement>(null);

  /*
   * Hide navbar on authentication
   * and dashboard pages.
   */
  const hideNavbar =
    [
      "/auth/login",
      "/auth/reset-password",
      "/auth/verify-email",
      "/auth/verify-login",
      "/auth/forgot-password",
      "/auth/signup",
    ].includes(pathname) ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin-dashboard");

  /*
   * Prevent body scrolling while
   * mobile menu is open.
   */
  useEffect(() => {
    document.body.style.overflow = isOpen
      ? "hidden"
      : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  /*
   * Close mobile menu when route changes.
   */
  useEffect(() => {
    setIsOpen(false);
    setMobileProfileOpen(false);
  }, [pathname]);

  /*
   * Close desktop dropdown when clicking outside.
   */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node,
        )
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  /*
   * Load platform branding.
   */
  useEffect(() => {
    async function loadBranding() {
      try {
        const res = await fetch(
          "/api/admin/settings",
        );

        const data = await res.json();

        if (
          data?.success &&
          data?.settings
        ) {
          setBranding({
            platformName:
              data.settings.platformName ||
              "Alifat Connect",

            logoUrl:
              data.settings.branding?.logoUrl ||
              "",
          });
        }
      } catch (error) {
        console.error(
          "Failed to load branding",
          error,
        );
      }
    }

    loadBranding();
  }, []);

  if (hideNavbar) {
    return null;
  }

  /*
   * Active navigation link.
   */
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  };

  /*
   * Close mobile menu.
   */
  const closeMenu = () => {
    setIsOpen(false);
    setMobileProfileOpen(false);
  };

  /*
   * Open logout confirmation.
   */
  const openLogoutConfirmation = () => {
    setDropdownOpen(false);
    setMobileProfileOpen(false);
    setIsOpen(false);
    setOpenLogoutModal(true);
  };

  /*
   * Logout.
   */
  const handleLogout = () => {
  if (isLoggingOut) return;

  setIsLoggingOut(true);

  setDropdownOpen(false);
  setMobileProfileOpen(false);
  setIsOpen(false);

  signOut({
    callbackUrl: "/",
  });
};

  /*
   * User initials.
   */
  const userInitial =
    session?.user?.name
      ?.charAt(0)
      .toUpperCase() || "U";

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-white/80 backdrop-blur-2xl dark:bg-black/80">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">

        {/* =====================================================
            MAIN NAVBAR
        ====================================================== */}
        <div className="flex h-16 items-center justify-between">

          {/* =================================================
              LOGO
          ================================================== */}
          <Link
            href="/"
            onClick={closeMenu}
            className="flex items-center gap-3"
          >
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={branding.platformName}
                className="h-10 w-10 rounded-full border-4 border-[#D4AF37] object-cover"
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

          {/* =================================================
              DESKTOP NAVIGATION
          ================================================== */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-[#D4AF37]"
                    : "text-gray-700 hover:text-[#D4AF37] dark:text-gray-300 dark:hover:text-[#D4AF37]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* =================================================
              DESKTOP ACCOUNT
          ================================================== */}
          <div className="hidden items-center md:flex">
            {session?.user ? (
              <div
                ref={dropdownRef}
                className="relative"
              >
                <button
                  type="button"
                  onClick={() =>
                    setDropdownOpen(
                      (prev) => !prev,
                    )
                  }
                  className="flex items-center gap-2 rounded-full border border-gray-200 px-2 py-2 transition hover:bg-gray-100 dark:border-white/10 dark:hover:bg-white/10"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37] font-bold text-black">
                    {userInitial}
                  </div>

                  <ChevronDown
                    className={`h-4 w-4 text-gray-500 transition-transform ${
                      dropdownOpen
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-zinc-950">

                    <div className="border-b border-gray-200 px-4 py-3 dark:border-white/10">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {session.user.name}
                      </p>

                      <p className="truncate text-xs text-gray-500">
                        {session.user.email}
                      </p>

                      {isAdmin && (
                        <span className="mt-1 inline-block text-xs font-medium text-[#D4AF37]">
                          Administrator
                        </span>
                      )}
                    </div>

                    <Link
                      href={dashboardPath}
                      onClick={() =>
                        setDropdownOpen(false)
                      }
                      className="flex items-center gap-3 px-4 py-3 text-sm transition hover:bg-gray-100 dark:hover:bg-white/10"
                    >
                      <LayoutDashboard className="h-4 w-4" />

                      {isAdmin
                        ? "Admin Dashboard"
                        : "Dashboard"}
                    </Link>

                    <button
                      type="button"
                      onClick={
                        openLogoutConfirmation
                      }
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-500 transition hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" />

                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-gray-700 transition hover:text-[#D4AF37] dark:text-gray-300"
                >
                  Login
                </Link>

                <Link
                  href="/auth/signup"
                  className="rounded-full border-2 border-[#D4AF37] px-5 py-2 font-semibold text-gray-900 transition hover:bg-[#D4AF37] hover:text-black dark:text-white"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* =================================================
              MOBILE MENU BUTTON

              Only logo + hamburger appear here.
          ================================================== */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() =>
                setIsOpen((prev) => !prev)
              }
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#B7972F] text-gray-900 transition hover:bg-gray-100 dark:border-[#B7972F] dark:text-white dark:hover:bg-white/10"
              aria-label={
                isOpen
                  ? "Close menu"
                  : "Open menu"
              }
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* =====================================================
            MOBILE MENU
        ====================================================== */}
        {isOpen && (
          <div className="border-t border-gray-200 dark:border-white/10 md:hidden">
            <div className="h-[calc(100vh-4rem)] overflow-y-auto">
              <div className="flex flex-col py-6">

                {/* =================================================
                    NAVIGATION LINKS
                ================================================== */}
                <div className="flex flex-col">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMenu}
                      className={`flex min-h-12 items-center border-b border-gray-200 text-base font-medium transition-colors dark:border-white/10 ${
                        isActive(link.href)
                          ? "text-[#D4AF37]"
                          : "text-gray-700 hover:text-[#D4AF37] dark:text-gray-300 dark:hover:text-[#D4AF37]"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                {/* =================================================
                    MOBILE ACCOUNT
                ================================================== */}
                {session?.user ? (
                  <div className="mt-6">

                    {/* =================================================
                        MOBILE USER PROFILE TRIGGER
                    ================================================== */}
                    <button
                      type="button"
                      onClick={() =>
                        setMobileProfileOpen(
                          (prev) => !prev,
                        )
                      }
                      className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-left transition hover:bg-gray-100 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                      aria-expanded={
                        mobileProfileOpen
                      }
                    >
                      {/* Avatar */}
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D4AF37] text-base font-bold text-black shadow-lg shadow-[#D4AF37]/20">
                        {userInitial}
                      </div>

                      {/* User information */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-gray-900 dark:text-white">
                          {session.user.name}
                        </p>

                        <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                          {session.user.email}
                        </p>

                        {isAdmin && (
                          <span className="mt-1 inline-flex rounded-full bg-[#D4AF37]/10 px-2 py-0.5 text-xs font-medium text-[#D4AF37]">
                            Administrator
                          </span>
                        )}
                      </div>

                      {/* Dropdown arrow */}
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200 ${
                          mobileProfileOpen
                            ? "rotate-180 text-[#D4AF37]"
                            : ""
                        }`}
                      />
                    </button>

                    {/* =================================================
                        AUTHENTICATED USER ACTIONS
                        
                        These ONLY appear when the user clicks
                        the profile.
                    ================================================== */}
                    {mobileProfileOpen && (
                      <div className="mt-3 flex flex-col gap-2 border-l-2 border-[#D4AF37]/30 pl-3">

                        {/* Dashboard */}
                        <Link
                          href={dashboardPath}
                          onClick={closeMenu}
                          className="flex min-h-12 items-center gap-3 rounded-xl border border-gray-200 px-4 font-medium text-gray-900 transition hover:bg-gray-100 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
                        >
                          <LayoutDashboard className="h-5 w-5 text-[#D4AF37]" />

                          <span>
                            {isAdmin
                              ? "Admin Dashboard"
                              : "Dashboard"}
                          </span>
                        </Link>

                        {/* Logout */}
                        <button
                          type="button"
                          onClick={
                            openLogoutConfirmation
                          }
                          className="flex min-h-12 items-center gap-3 rounded-xl px-4 text-left font-medium text-red-500 transition hover:bg-red-500/10"
                        >
                          <LogOut className="h-5 w-5" />

                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* =================================================
                     MOBILE GUEST ACTIONS
                  ================================================== */
                  <div className="mt-6 flex flex-col gap-3">

                    <Link
                      href="/auth/login"
                      onClick={closeMenu}
                      className="flex min-h-12 items-center gap-3 rounded-xl border border-gray-200 px-4 font-medium text-gray-900 transition hover:bg-gray-100 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
                    >
                      <User className="h-5 w-5 text-[#D4AF37]" />

                      Login
                    </Link>

                    <Link
                      href="/auth/signup"
                      onClick={closeMenu}
                      className="flex min-h-12 items-center justify-center rounded-xl bg-[#D4AF37] px-4 font-semibold text-black transition hover:bg-[#c9a52f]"
                    >
                      Sign Up
                    </Link>

                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =======================================================
          LOGOUT CONFIRMATION MODAL
      ======================================================== */}
      <Dialog
        open={openLogoutModal}
        onOpenChange={(open) => {
          setOpenLogoutModal(open);

          if (!open) {
            setDropdownOpen(false);
            setMobileProfileOpen(false);
          }
        }}
      >
        <DialogContent className="rounded-3xl border border-zinc-200 p-6 shadow-2xl dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Logout Account
            </DialogTitle>

            <DialogDescription className="pt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Are you sure you want to logout from
              your account?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
  <Button
    type="button"
    variant="outline"
    disabled={isLoggingOut}
    onClick={() =>
      setOpenLogoutModal(false)
    }
    className="h-11 w-full rounded-2xl sm:w-auto"
  >
    No
  </Button>

  <Button
  type="button"
  disabled={isLoggingOut}
  onClick={handleLogout}
  className="h-11 w-full rounded-2xl bg-red-500 text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
>
  {isLoggingOut ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
     
    </>
  ) : (
    <>
      <LogOut className="mr-2 h-4 w-4" />
      Yes, Logout
    </>
  )}
</Button>
</DialogFooter>
        </DialogContent>
      </Dialog>
    </nav>
  );
}