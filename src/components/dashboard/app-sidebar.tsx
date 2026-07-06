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
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const [branding, setBranding] = useState({
    platformName: "Alifat Connect",
    logoUrl: "",
  });

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  const isMobileGroupActive = pathname === "/dashboard/airtime" || pathname === "/dashboard/data";
  const isUtilitiesGroupActive =
    pathname === "/dashboard/subscription" ||
    pathname === "/dashboard/electricity" ||
    pathname === "/dashboard/recharge-card";
  const isBillsGroupActive = pathname === "/dashboard/education";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [utilitiesOpen, setUtilitiesOpen] = useState(false);
  const [billsOpen, setBillsOpen] = useState(false);

  // Sync state cleanly with route changes
  useEffect(() => {
    if (isMobileGroupActive) setMobileOpen(true);
  }, [isMobileGroupActive]);

  useEffect(() => {
    if (isUtilitiesGroupActive) setUtilitiesOpen(true);
  }, [isUtilitiesGroupActive]);

  useEffect(() => {
    if (isBillsGroupActive) setBillsOpen(true);
  }, [isBillsGroupActive]);

  useEffect(() => {
    async function loadBranding() {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();

        if (data?.success) {
          setBranding({
            platformName: data.settings?.platformName || "Alifat Connect",
            logoUrl: data.settings?.branding?.logoUrl || "",
          });
        }
      } catch (error) {
        console.error("Failed to load branding:", error);
      }
    }
    loadBranding();
  }, []);

  const menuClass = (active: boolean) =>
    `group relative flex h-10 w-full items-center gap-3 overflow-hidden rounded-xl px-3 text-sm font-medium transition-all duration-200 ${
      active
        ? "bg-gradient-to-r from-yellow-500/20 to-transparent text-yellow-600 dark:text-yellow-400 font-semibold"
        : "text-zinc-500 hover:bg-zinc-100/80 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-50"
    }`;

  const triggerClass = (isActiveGroup: boolean) =>
    `flex h-10 w-full items-center justify-between rounded-xl px-3 text-sm font-medium transition-all duration-200 ${
      isActiveGroup
        ? "text-yellow-600 dark:text-yellow-400 font-semibold bg-yellow-500/10 dark:bg-yellow-500/5"
        : "text-zinc-500 hover:bg-zinc-100/80 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-50"
    }`;

  return (
    <Sidebar
      collapsible="icon"
      className="w-[280px] border-r border-black bg-white backdrop-blur-md dark:border-white dark:bg-zinc-950/80 md:w-[290px]"
    >
      {/* HEADER */}
      <SidebarHeader className="sticky top-0 z-10 border-b border-black bg-white px-4 py-3.5 backdrop-blur-md dark:border-white dark:bg-black">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Logo box */}
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-zinc-200/80 dark:border-zinc-800">
            {branding.logoUrl ? (
              <Image
                src={branding.logoUrl}
                fill
                alt={branding.platformName}
                sizes="36px"
                priority
                className="object-contain p-1"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-400 to-amber-600 text-xs font-bold text-zinc-950">
                {branding.platformName
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}
          </div>

          {/* Brand text */}
          <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white truncate group-data-[collapsible=icon]:hidden">
            {branding.platformName}
          </span>
        </div>
      </SidebarHeader>

      {/* SIDEBAR SCROLLABLE CONTENT */}
      <SidebarContent className="px-3 py-4 space-y-4 bg-white dark:bg-black overflow-y-auto">
        
        {/* CORE NAVIGATION */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-3 text-[11px] font-bold tracking-wider uppercase text-zinc-400/80 dark:text-zinc-500/80 group-data-[collapsible=icon]:hidden">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-1.5">
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Dashboard" asChild>
                  <Link href="/dashboard" onClick={handleLinkClick} className={menuClass(pathname === "/dashboard")}>
                    <LayoutDashboard className="h-4 w-4 shrink-0 stroke-[2.2]" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Wallet" asChild>
                  <Link href="/dashboard/wallet" onClick={handleLinkClick} className={menuClass(pathname === "/dashboard/wallet")}>
                    <Wallet className="h-4 w-4 shrink-0 stroke-[2.2]" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">Wallet</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Become Seller" asChild>
                  <Link href="/dashboard/become-seller" onClick={handleLinkClick} className={menuClass(pathname === "/dashboard/become-seller")}>
                    <Store className="h-4 w-4 shrink-0 stroke-[2.2]" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">Become Seller</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* SERVICES MULTI-LEVEL LOGIC */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-3 text-[11px] font-bold tracking-wider uppercase text-zinc-400/80 dark:text-zinc-500/80 group-data-[collapsible=icon]:hidden">
            Services
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-1.5">
            <SidebarMenu className="space-y-1">
              
              {/* MOBILE ACCORDION */}
              <SidebarMenuItem>
                <button
                  type="button"
                  onClick={() => setMobileOpen((prev) => !prev)}
                  className={triggerClass(isMobileGroupActive)}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Smartphone className="h-4 w-4 shrink-0 stroke-[2.2]" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">Mobile Rails</span>
                  </div>
                  <div className="group-data-[collapsible=icon]:hidden text-zinc-400">
                    {mobileOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  </div>
                </button>

                <div className={`overflow-hidden transition-all duration-200 ease-in-out group-data-[collapsible=icon]:hidden ${mobileOpen ? "mt-1 max-h-32 opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="ml-4 border-l border-zinc-200/80 dark:border-zinc-800 pl-2 mt-0.5 space-y-0.5">
                    <Link href="/dashboard/airtime" onClick={handleLinkClick} className={menuClass(pathname === "/dashboard/airtime")}>
                      <Smartphone className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">Buy Airtime</span>
                    </Link>
                    <Link href="/dashboard/data" onClick={handleLinkClick} className={menuClass(pathname === "/dashboard/data")}>
                      <Wifi className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">Buy Data</span>
                    </Link>
                  </div>
                </div>
              </SidebarMenuItem>

              {/* UTILITIES ACCORDION */}
              <SidebarMenuItem>
                <button
                  type="button"
                  onClick={() => setUtilitiesOpen((prev) => !prev)}
                  className={triggerClass(isUtilitiesGroupActive)}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Zap className="h-4 w-4 shrink-0 stroke-[2.2]" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">Utilities</span>
                  </div>
                  <div className="group-data-[collapsible=icon]:hidden text-zinc-400">
                    {utilitiesOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  </div>
                </button>

                <div className={`overflow-hidden transition-all duration-200 ease-in-out group-data-[collapsible=icon]:hidden ${utilitiesOpen ? "mt-1 max-h-44 opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="ml-4 border-l border-zinc-200/80 dark:border-zinc-800 pl-2 mt-0.5 space-y-0.5">
                    <Link href="/dashboard/subscription" onClick={handleLinkClick} className={menuClass(pathname === "/dashboard/subscription")}>
                      <Tv className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">TV Subscription</span>
                    </Link>
                    <Link href="/dashboard/electricity" onClick={handleLinkClick} className={menuClass(pathname === "/dashboard/electricity")}>
                      <Zap className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">Electricity Token</span>
                    </Link>
                    <Link href="/dashboard/recharge-card" onClick={handleLinkClick} className={menuClass(pathname === "/dashboard/recharge-card")}>
                      <CreditCard className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">Recharge Card Pin</span>
                    </Link>
                  </div>
                </div>
              </SidebarMenuItem>

              {/* BILLS ACCORDION */}
              <SidebarMenuItem>
                <button
                  type="button"
                  onClick={() => setBillsOpen((prev) => !prev)}
                  className={triggerClass(isBillsGroupActive)}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Receipt className="h-4 w-4 shrink-0 stroke-[2.2]" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">Invoicing & Bills</span>
                  </div>
                  <div className="group-data-[collapsible=icon]:hidden text-zinc-400">
                    {billsOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  </div>
                </button>

                <div className={`overflow-hidden transition-all duration-200 ease-in-out group-data-[collapsible=icon]:hidden ${billsOpen ? "mt-1 max-h-24 opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="ml-4 border-l border-zinc-200/80 dark:border-zinc-800 pl-2 mt-0.5 space-y-0.5">
                    <Link href="/dashboard/education" onClick={handleLinkClick} className={menuClass(pathname === "/dashboard/education")}>
                      <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">Educational Bills</span>
                    </Link>
                  </div>
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* TRANSACTIONS SECTION */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-3 text-[11px] font-bold tracking-wider uppercase text-zinc-400/80 dark:text-zinc-500/80 group-data-[collapsible=icon]:hidden">
            Ledger Settlements
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-1.5">
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Recharge History" asChild>
                  <Link href="/dashboard/recharge-history" onClick={handleLinkClick} className={menuClass(pathname === "/dashboard/recharge-history")}>
                    <Receipt className="h-4 w-4 shrink-0 stroke-[2.2]" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">Recharge History</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Manage Wallet" asChild>
                  <Link href="/dashboard/manage-wallet" onClick={handleLinkClick} className={menuClass(pathname === "/dashboard/manage-wallet")}>
                    <BadgeDollarSign className="h-4 w-4 shrink-0 stroke-[2.2]" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">Manage Wallet</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Reports" asChild>
                  <Link href="/dashboard/reports" onClick={handleLinkClick} className={menuClass(pathname === "/dashboard/reports")}>
                    <FileDown className="h-4 w-4 shrink-0 stroke-[2.2]" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">Reports</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* SETTINGS AND MANAGEMENT */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-3 text-[11px] font-bold tracking-wider uppercase text-zinc-400/80 dark:text-zinc-500/80 group-data-[collapsible=icon]:hidden">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-1.5">
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings" asChild>
                  <Link href="/dashboard/settings" onClick={handleLinkClick} className={menuClass(pathname === "/dashboard/settings")}>
                    <Settings className="h-4 w-4 shrink-0 stroke-[2.2]" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">Settings Configuration</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* OTHER ITEMS */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-3 text-[11px] font-bold tracking-wider uppercase text-zinc-400/80 dark:text-zinc-500/80 group-data-[collapsible=icon]:hidden">
            Others
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-1.5">
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Referral" asChild>
                  <Link href="/dashboard/referral" onClick={handleLinkClick} className={menuClass(pathname === "/dashboard/referral")}>
                    <Users className="h-4 w-4 shrink-0 stroke-[2.2]" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">Affiliate & Referrals</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* PINNED FIXED FOOTER (Stays locked at bottom) */}
      <SidebarFooter className="sticky bottom-0 z-10 border-t border-zinc-100 bg-white p-3 backdrop-blur-md dark:border-zinc-900 dark:bg-black">
        <SidebarMenu>
          <SidebarMenuItem>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="flex h-10 w-full items-center gap-3 overflow-hidden rounded-xl px-3 text-sm font-semibold text-red-500/90 transition-all duration-200 hover:bg-red-500/10 dark:hover:bg-red-500/20"
            >
              <LogOut className="h-4 w-4 shrink-0 stroke-[2.2]" />
              <span className="truncate group-data-[collapsible=icon]:hidden">Logout Terminal</span>
            </button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}