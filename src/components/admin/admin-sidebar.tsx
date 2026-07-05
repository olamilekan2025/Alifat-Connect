"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  Wallet,
  Gift,
  Bell,
  Settings,
  ShieldCheck,
  BadgeCheck,
  CreditCard,
  ClipboardList,
  BarChart3,
  MessageSquare,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  {
    name: "Dashboard",
    href: "/admin-dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Users",
    href: "/admin-dashboard/users",
    icon: Users,
  },
  {
    name: "Transactions",
    href: "/admin-dashboard/transactions",
    icon: ArrowLeftRight,
  },
  {
    name: "Wallet",
    href: "/admin-dashboard/wallet",
    icon: Wallet,
  },
  {
    name: "Notifications",
    href: "/admin-dashboard/admin-notifications",
    icon: Bell,
  },
  {
    name: "Support",
    href: "/admin-dashboard/support",
    icon: MessageSquare,
  },
  {
    name: "Referrals",
    href: "/admin-dashboard/referrals",
    icon: Gift,
  },
  {
    name: "Audit Logs",
    href: "/admin-dashboard/audit-logs",
    icon: ClipboardList,
  },
  {
    name: "Reports",
    href: "/admin-dashboard/reports",
    icon: BarChart3,
  },
  {
    name: "KYC",
    href: "/admin-dashboard/kyc",
    icon: BadgeCheck,
  },
  {
    name: "Payments",
    href: "/admin-dashboard/payments",
    icon: CreditCard,
  },
  {
    name: "Security",
    href: "/admin-dashboard/security",
    icon: ShieldCheck,
  },
  {
    name: "Settings",
    href: "/admin-dashboard/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [hovered, setHovered] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const [branding, setBranding] = useState({
    platformName: "ACP Admin",
    logoUrl: "",
  });

  useEffect(() => {
    async function loadBranding() {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();

        if (data?.success) {
          setBranding({
            platformName: data.settings?.platformName || "ACP Admin",
            logoUrl: data.settings?.branding?.logoUrl || "",
          });
        }
      } catch (error) {
        console.error("Failed to load branding:", error);
      }
    }

    loadBranding();
  }, []);

  return (
    <>
      {/* Mobile Toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-zinc-900/80 backdrop-blur lg:hidden"
      >
        <Menu className="h-5 w-5 text-white" />
      </button>

      {/* Desktop Collapse Toggle */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="fixed left-4 bottom-4 z-50 hidden lg:flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-zinc-900/80 backdrop-blur hover:bg-zinc-800 transition-colors"
        title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {collapsed ? <Menu className="h-5 w-5 text-red-400" /> : <X className="h-5 w-5 text-white" />}
      </button>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-black dark:border-white/30 bg-white dark:bg-black backdrop-blur-2xl transition-all duration-300 lg:relative lg:translate-x-0",
          mobileOpen ? "translate-x-0 w-[280px]" : "-translate-x-full w-[280px]",
          collapsed ? "lg:w-20" : "lg:w-[280px]",
          "lg:flex",
        )}
      >

        {/* Header */}
        <div
          className="relative z-10 flex items-center justify-between border-b border-zinc-200 dark:border-white/30 p-4 lg:p-6"
        >
          <div className="flex items-center gap-3">
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={branding.platformName}
                className="h-10 w-10 lg:h-12 lg:w-12 rounded-xl lg:rounded-2xl object-cover border border-zinc-200 dark:border-white/10"
              />
            ) : (
              <div className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-xl lg:rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 text-black font-black shadow-lg">
                {branding.platformName
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}

            {!collapsed && (
              <div className="hidden lg:block">
                <h2 className="text-base lg:text-lg font-black tracking-wide text-zinc-900 dark:text-white">
                  {branding.platformName}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Control Center
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-white/10 lg:hidden"
          >
            <X className="h-5 w-5 text-zinc-900 dark:text-white" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex-1 space-y-2 overflow-y-auto p-3 lg:p-4">
          {links.map((link) => {
            const Icon = link.icon;

            const isActive =
  link.href === "/admin-dashboard"
    ? pathname === "/admin-dashboard"
    : pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                onMouseEnter={() => setHovered(link.href)}
                onMouseLeave={() => setHovered(null)}
                className={cn(
                  "group relative flex items-center gap-3 overflow-hidden rounded-xl lg:rounded-2xl px-3 py-2 lg:px-4 lg:py-3 transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg"
                    : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white",
                  collapsed ? "justify-center" : "",
                )}
                title={collapsed ? link.name : undefined}
              >
                <Icon className="relative z-10 h-5 w-5 shrink-0" />

                {!collapsed && (
                  <span className="relative z-10 truncate font-medium">
                    {link.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="relative z-10 border-t border-zinc-200 dark:border-white/10 p-3 lg:p-1">
          <button
            type="button"
            onClick={() => window.location.href = '/auth/login'}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl lg:rounded-2xl px-3 py-2 lg:px-4 lg:py-3 text-red-600 transition hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300",
              collapsed ? "justify-center" : "",
            )}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}


