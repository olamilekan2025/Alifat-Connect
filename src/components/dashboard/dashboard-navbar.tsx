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
      <header className="fixed left-0 right-0 top-0 mx-auto flex w-full max-w-5xl items-center justify-between gap-6 border-b border-zinc-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/90 md:px-6">
        {/* LEFT */}
        <div className="flex min-w-0 h-15 w-400 flex-col">
          {/* <div className="flex items-center gap-2">
            <h1 className="truncate text-[1.65rem] font-bold leading-none tracking-tight text-zinc-900 dark:text-white">
              {title}
            </h1>

            <div className="hidden h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 sm:block" />
          </div> */}

          <p className="mt-5 flex items-center gap-1 text-4x1 font-medium text-zinc-500 dark:text-zinc-400">
            <span>Welcome back,</span>

            <span className="truncate font-semibold text-zinc-900 dark:text-white">
              {firstName}
            </span>

            <span className="text-base">👋</span>
          </p>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* NOTIFICATION */}
          <Button
            variant="outline"
            size="icon"
            className="relative h-11 w-11 shrink-0 rounded-2xl border border-zinc-200 bg-white/90 shadow-sm transition-all duration-200 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            <Bell className="h-[18px] w-[18px] text-zinc-700 dark:text-zinc-200" />

            {/* NOTIFICATION DOT */}
            <span className="absolute right-3 top-3 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />

              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
          </Button>

          {/* PROFILE */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center rounded-2xl border border-zinc-200 bg-white/90 p-1.5 shadow-sm transition-all duration-200 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
                {/* AVATAR */}
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-700 text-sm font-bold text-white shadow-sm dark:from-white dark:to-zinc-300 dark:text-black">
                  {initials}
                </div>
              </button>
            </DropdownMenuTrigger>

            {/* DROPDOWN */}
            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="w-64 rounded-2xl border border-zinc-200 bg-white/95 p-2 shadow-2xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/95"
            >
              {/* USER CARD */}
              <div className="mb-1 flex items-center gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-700 text-sm font-bold text-white dark:from-white dark:to-zinc-300 dark:text-black">
                  {initials}
                </div>

                <div className="overflow-hidden">
                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                    {user.name}
                  </p>

                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {user.email}
                  </p>
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* HOME */}
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard"
                  className="flex h-11 items-center gap-3 rounded-xl px-3 font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </DropdownMenuItem>

              {/* PROFILE */}
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/profile"
                  className="flex h-11 items-center gap-3 rounded-xl px-3 font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  <User className="h-4 w-4" />
                  Profile Page
                </Link>
              </DropdownMenuItem>

              {/* SETTINGS */}
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/settings"
                  className="flex h-11 items-center gap-3 rounded-xl px-3 font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* LOGOUT */}
              <DropdownMenuItem
                onClick={() => setOpenLogoutModal(true)}
                className="flex h-11 items-center gap-3 rounded-xl px-3 font-medium text-red-500 transition-colors hover:bg-red-50 focus:bg-red-50 focus:text-red-500 dark:hover:bg-red-950/40 dark:focus:bg-red-950/40"
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

          <DialogFooter className="mt-4 flex-row gap-3 sm:justify-end">
            {/* NO BUTTON */}
            <Button
              variant="outline"
              onClick={() => setOpenLogoutModal(false)}
              className="h-11 rounded-2xl px-6"
            >
              No
            </Button>

            {/* YES BUTTON */}
            <Button
              onClick={handleLogout}
              className="h-11 rounded-2xl bg-red-500 px-6 text-white hover:bg-red-600"
            >
              Yes, Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}