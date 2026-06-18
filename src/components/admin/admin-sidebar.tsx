"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  Wallet,
  Gift,
  Bell,
  Settings,
  Shield,
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
          "fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col border-r border-white/10 bg-zinc-950/95 backdrop-blur-2xl transition-transform duration-300 lg:relative lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:flex",
        )}
      >
        {/* Background */}
        <div
          className="
    pointer-events-none absolute inset-0
    bg-white
    dark:bg-black
  "
        />

        {/* Header */}
        <div
          className="
  relative z-10 flex items-center justify-between
  border-b border-zinc-200
  p-6
  dark:border-white/10
"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 text-black shadow-lg">
              <Shield className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-lg font-black tracking-wide">ACP Admin</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Control Center
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="
  rounded-lg p-2
  hover:bg-zinc-100
  lg:hidden
  dark:hover:bg-white/10
"
          >
            <X className="h-5 w-5 text-zinc-900 dark:text-white" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex-1 space-y-2 overflow-y-auto p-4">
          {links.map((link) => {
            const Icon = link.icon;

            const isActive =
              pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                onMouseEnter={() => setHovered(link.href)}
                onMouseLeave={() => setHovered(null)}
                className={cn(
                  "group relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg"
                    : `
      text-zinc-700
      hover:bg-zinc-100
      hover:text-zinc-900
      dark:text-zinc-300
      dark:hover:bg-white/5
      dark:hover:text-white
    `,
                )}
              >
                {!isActive && hovered === link.href && (
                  <span className="absolute inset-0 bg-zinc-100 dark:bg-white/5" />
                )}

                <Icon className="relative z-10 h-5 w-5 shrink-0" />

                <span className="relative z-10 truncate font-medium">
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className="
  relative z-10
  border-t border-zinc-200
  p-4
  dark:border-white/10
"
        >
          <button
            type="button"
            className="
  flex w-full items-center gap-3 rounded-2xl px-4 py-3
  text-red-600
  transition
  hover:bg-red-100
  hover:text-red-700
  dark:text-red-400
  dark:hover:bg-red-500/10
  dark:hover:text-red-300
"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
