"use client";

import Link from "next/link";

import Image from "next/image";

import { usePathname } from "next/navigation";

import { useEffect, useState } from "react";

import { signOut } from "next-auth/react";

import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Settings,
  Users,
  LogOut,
  ChevronDown,
  ChevronRight,
  Smartphone,
  Wifi,
  Tv,
  GraduationCap,
  BadgeDollarSign,
  FileDown,
  CreditCard,
  Zap,
  Store,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const pathname = usePathname();

  const isMobileGroupActive =
    pathname ===
      "/dashboard/airtime" ||
    pathname ===
      "/dashboard/data";

  const isUtilitiesGroupActive =
    pathname ===
      "/dashboard/subscription" ||
    pathname ===
      "/dashboard/electricity" ||
    pathname ===
      "/dashboard/recharge-card";

  const isBillsGroupActive =
    pathname ===
    "/dashboard/education";

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [
    utilitiesOpen,
    setUtilitiesOpen,
  ] = useState(false);

  const [billsOpen, setBillsOpen] =
    useState(false);

  // FIXED: no more infinite re-render
  useEffect(() => {
    if (isMobileGroupActive) {
      setMobileOpen(true);
    }
  }, [isMobileGroupActive]);

  useEffect(() => {
    if (
      isUtilitiesGroupActive
    ) {
      setUtilitiesOpen(true);
    }
  }, [isUtilitiesGroupActive]);

  useEffect(() => {
    if (isBillsGroupActive) {
      setBillsOpen(true);
    }
  }, [isBillsGroupActive]);

  const menuClass = (
    active: boolean,
  ) =>
    `group relative flex h-11 w-full items-center gap-3 rounded-2xl px-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/50 ${
      active
        ? "bg-gradient-to-r from-[#D4AF37]/18 to-[#D4AF37]/8 text-[#D4AF37] shadow-sm shadow-[#D4AF37]/10 dark:from-[#D4AF37]/15 dark:to-[#D4AF37]/5 dark:text-[#F3D86B]"
        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
    }`;

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-zinc-200 bg-white/95 backdrop-blur-xl dark:border-zinc-800 dark:bg-black"
    >
      {/* HEADER */}
      <SidebarHeader className="border-b border-zinc-200 px-4 py-5 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-full shrink-0 overflow-hidden rounded-2xl">
            <Image
              src="/logo.png"
              fill
              alt="Logo"
              sizes="(max-width: 768px) 100px, 120px"
              priority
              className="object-cover object-left transition-all duration-300 group-data-[collapsible=icon]:object-center"
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-5">
        {/* NAVIGATION */}
        <SidebarGroup>
          <SidebarGroupLabel>
            Navigation
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Dashboard"
                  asChild
                >
                  <Link
                    href="/dashboard"
                    className={menuClass(
                      pathname ===
                        "/dashboard",
                    )}
                  >
                    <LayoutDashboard className="h-5 w-5 shrink-0" />

                    <span className="truncate">
                      Dashboard
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Wallet"
                  asChild
                >
                  <Link
                    href="/dashboard/wallet"
                    className={menuClass(
                      pathname ===
                        "/dashboard/wallet",
                    )}
                  >
                    <Wallet className="h-5 w-5 shrink-0" />

                    <span className="truncate">
                      Wallet
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Become Seller"
                  asChild
                >
                  <Link
                    href="/dashboard/become-seller"
                    className={menuClass(
                      pathname ===
                        "/dashboard/become-seller",
                    )}
                  >
                    <Store className="h-5 w-5 shrink-0" />

                    <span className="truncate">
                      Become Seller
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* SERVICES */}
        <SidebarGroup className="mt-2">
          <SidebarGroupLabel>
            Services
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {/* MOBILE */}
              <SidebarMenuItem>
                <button
                  type="button"
                  onClick={() =>
                    setMobileOpen(
                      (
                        prev,
                      ) => !prev,
                    )
                  }
                  className="flex h-11 w-full items-center justify-between rounded-2xl px-3 text-zinc-500 transition-all hover:bg-zinc-100 hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Smartphone className="h-5 w-5 shrink-0" />

                    <span className="truncate group-data-[collapsible=icon]:hidden">
                      Mobile
                    </span>
                  </div>

                  <div className="group-data-[collapsible=icon]:hidden">
                    {mobileOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out group-data-[collapsible=icon]:hidden ${
                    mobileOpen
                      ? "mt-2 max-h-40 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="ml-6 space-y-1 border-l border-zinc-200 pl-4 dark:border-zinc-800">
                    <Link
                      href="/dashboard/airtime"
                      className={menuClass(
                        pathname ===
                          "/dashboard/airtime",
                      )}
                    >
                      <Smartphone className="h-4 w-4 shrink-0" />

                      <span className="truncate">
                        Buy Airtime
                      </span>
                    </Link>

                    <Link
                      href="/dashboard/data"
                      className={menuClass(
                        pathname ===
                          "/dashboard/data",
                      )}
                    >
                      <Wifi className="h-4 w-4 shrink-0" />

                      <span className="truncate">
                        Buy Data
                      </span>
                    </Link>
                  </div>
                </div>
              </SidebarMenuItem>

              {/* UTILITIES */}
              <SidebarMenuItem>
                <button
                  type="button"
                  onClick={() =>
                    setUtilitiesOpen(
                      (
                        prev,
                      ) => !prev,
                    )
                  }
                  className="flex h-11 w-full items-center justify-between rounded-2xl px-3 text-zinc-500 transition-all hover:bg-zinc-100 hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 shrink-0" />

                    <span className="truncate group-data-[collapsible=icon]:hidden">
                      Utilities
                    </span>
                  </div>

                  <div className="group-data-[collapsible=icon]:hidden">
                    {utilitiesOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out group-data-[collapsible=icon]:hidden ${
                    utilitiesOpen
                      ? "mt-2 max-h-52 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="ml-6 space-y-1 border-l border-zinc-200 pl-4 dark:border-zinc-800">
                    <Link
                      href="/dashboard/subscription"
                      className={menuClass(
                        pathname ===
                          "/dashboard/subscription",
                      )}
                    >
                      <Tv className="h-4 w-4 shrink-0" />

                      <span className="truncate">
                        Subscription
                      </span>
                    </Link>

                    <Link
                      href="/dashboard/electricity"
                      className={menuClass(
                        pathname ===
                          "/dashboard/electricity",
                      )}
                    >
                      <Zap className="h-4 w-4 shrink-0" />

                      <span className="truncate">
                        Electricity
                      </span>
                    </Link>

                    <Link
                      href="/dashboard/recharge-card"
                      className={menuClass(
                        pathname ===
                          "/dashboard/recharge-card",
                      )}
                    >
                      <CreditCard className="h-4 w-4 shrink-0" />

                      <span className="truncate">
                        Recharge Card
                      </span>
                    </Link>
                  </div>
                </div>
              </SidebarMenuItem>

              {/* BILLS */}
              <SidebarMenuItem>
                <button
                  type="button"
                  onClick={() =>
                    setBillsOpen(
                      (
                        prev,
                      ) => !prev,
                    )
                  }
                  className="flex h-11 w-full items-center justify-between rounded-2xl px-3 text-zinc-500 transition-all hover:bg-zinc-100 hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-3">
                    <Receipt className="h-5 w-5 shrink-0" />

                    <span className="truncate group-data-[collapsible=icon]:hidden">
                      Bills
                    </span>
                  </div>

                  <div className="group-data-[collapsible=icon]:hidden">
                    {billsOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out group-data-[collapsible=icon]:hidden ${
                    billsOpen
                      ? "mt-2 max-h-32 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="ml-6 space-y-1 border-l border-zinc-200 pl-4 dark:border-zinc-800">
                    <Link
                      href="/dashboard/education"
                      className={menuClass(
                        pathname ===
                          "/dashboard/education",
                      )}
                    >
                      <GraduationCap className="h-4 w-4 shrink-0" />

                      <span className="truncate">
                        Educational Bills
                      </span>
                    </Link>
                  </div>
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* TRANSACTIONS */}
        <SidebarGroup className="mt-2">
          <SidebarGroupLabel>
            Transactions
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Recharge History"
                  asChild
                >
                  <Link
                    href="/dashboard/recharge-history"
                    className={menuClass(
                      pathname ===
                        "/dashboard/recharge-history",
                    )}
                  >
                    <Receipt className="h-5 w-5 shrink-0" />

                    <span className="truncate">
                      Recharge History
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Manage Wallet"
                  asChild
                >
                  <Link
                    href="/dashboard/manage-wallet"
                    className={menuClass(
                      pathname ===
                        "/dashboard/manage-wallet",
                    )}
                  >
                    <BadgeDollarSign className="h-5 w-5 shrink-0" />

                    <span className="truncate">
                      Manage Wallet
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Reports"
                  asChild
                >
                  <Link
                    href="/dashboard/reports"
                    className={menuClass(
                      pathname ===
                        "/dashboard/reports",
                    )}
                  >
                    <FileDown className="h-5 w-5 shrink-0" />

                    <span className="truncate">
                      Reports
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* MANAGEMENT */}
        <SidebarGroup className="mt-2">
          <SidebarGroupLabel>
            Management
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Settings"
                  asChild
                >
                  <Link
                    href="/dashboard/settings"
                    className={menuClass(
                      pathname ===
                        "/dashboard/settings",
                    )}
                  >
                    <Settings className="h-5 w-5 shrink-0" />

                    <span className="truncate">
                      Settings
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* OTHERS */}
        <SidebarGroup className="mt-2">
          <SidebarGroupLabel>
            Others
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Referral"
                  asChild
                >
                  <Link
                    href="/dashboard/referral"
                    className={menuClass(
                      pathname ===
                        "/dashboard/referral",
                    )}
                  >
                    <Users className="h-5 w-5 shrink-0" />

                    <span className="truncate">
                      Referral
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <button
                  type="button"
                  onClick={() =>
                    signOut({
                      callbackUrl:
                        "/auth/login",
                    })
                  }
                  className="flex h-11 w-full items-center gap-3 rounded-2xl px-3 text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <LogOut className="h-5 w-5 shrink-0" />

                  <span className="truncate">
                    Logout
                  </span>
                </button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}