"use client";

import { useState } from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

import {
  Bell,
  Home,
  User,
  Settings,
  LogOut,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/wallet": "Wallet",
  "/dashboard/data": "Buy Data",
  "/dashboard/airtime": "Buy Airtime",
  "/dashboard/electricity": "Electricity",
  "/dashboard/subscription": "TV Subscription",
  "/dashboard/settings": "Settings",
  "/dashboard/profile": "Profile",
};

export function DashboardNavbar() {
  const pathname = usePathname();

  const router = useRouter();

  const { data: session } = useSession();

  const [openLogoutModal, setOpenLogoutModal] = useState(false);

  const title = pageTitles[pathname] || "Dashboard";

  // USER DATA
  const user = {
    name: session?.user?.name || "Guest User",
    email: session?.user?.email || "guest@example.com",
  };

  // FIRST NAME
  const firstName = user.name.split(" ")[0];

  // INITIALS
  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join("");

  // LOGOUT
  const handleLogout = async () => {
    await signOut({
      redirect: false,
    });

    router.push("/");
  };

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-40 flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white/90 px-4 shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/90 md:h-20 md:px-6">
  {/* LEFT */}
 <div className="flex min-w-0 flex-1 items-center gap-3">
  <SidebarTrigger className="h-10 w-10 shrink-0 rounded-xl border border-zinc-200 bg-white shadow-sm hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800" />

  <div className="min-w-0 flex flex-col">
    <span className="hidden text-xs font-medium uppercase tracking-wider text-zinc-400 sm:block">
      {title}
    </span>

    <p className="flex items-center gap-1 text-sm font-medium text-zinc-500 dark:text-zinc-400 sm:text-base">
      <span className="hidden sm:inline">
        Welcome back,
      </span>

      <span className="truncate font-semibold text-zinc-900 dark:text-white">
        {firstName}
      </span>

      <span>👋</span>
    </p>
  </div>
</div>

  {/* RIGHT */}
  <div className="flex shrink-0 items-center gap-2 sm:gap-3">
    {/* NOTIFICATION */}
    <Button
      variant="outline"
      size="icon"
      className="relative h-10 w-10 rounded-2xl border border-zinc-200 bg-white/90 shadow-sm transition-all hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 sm:h-11 sm:w-11"
    >
      <Bell className="h-4 w-4 text-zinc-700 dark:text-zinc-200" />

      <span className="absolute right-2.5 top-2.5 flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
      </span>
    </Button>

    {/* PROFILE */}
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center rounded-2xl border border-zinc-200 bg-white/90 p-1 shadow-sm transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-700 text-xs font-bold text-white dark:from-white dark:to-zinc-300 dark:text-black sm:h-11 sm:w-11 sm:text-sm">
            {initials}
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 rounded-2xl border border-zinc-200 bg-white/95 p-2 shadow-2xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/95"
      >
        {/* USER CARD */}
        <div className="mb-1 flex items-center gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-700 text-sm font-bold text-white dark:from-white dark:to-zinc-300 dark:text-black">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
              {user.name}
            </p>

            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              {user.email}
            </p>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            href="/dashboard"
            className="flex h-11 items-center gap-3 rounded-xl px-3"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/dashboard/profile"
            className="flex h-11 items-center gap-3 rounded-xl px-3"
          >
            <User className="h-4 w-4" />
            Profile Page
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/dashboard/settings"
            className="flex h-11 items-center gap-3 rounded-xl px-3"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => setOpenLogoutModal(true)}
          className="flex h-11 items-center gap-3 rounded-xl px-3 text-red-500"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</header>

      {/* LOGOUT MODAL */}
      <Dialog
        open={openLogoutModal}
        onOpenChange={setOpenLogoutModal}
      >
        <DialogContent className="rounded-3xl border border-zinc-200 p-6 shadow-2xl dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Logout Account
            </DialogTitle>

            <DialogDescription className="pt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Are you sure you want to logout from your account?
            </DialogDescription>
          </DialogHeader>

         <DialogFooter className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
  <Button
    variant="outline"
    onClick={() => setOpenLogoutModal(false)}
    className="h-11 w-full rounded-2xl sm:w-auto"
  >
    No
  </Button>

  <Button
    onClick={handleLogout}
    className="h-11 w-full rounded-2xl bg-red-500 text-white hover:bg-red-600 sm:w-auto"
  >
    Yes, Logout
  </Button>
</DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}