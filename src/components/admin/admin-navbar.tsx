"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

import { Bell, Home, Search, LogOut, ChevronDown } from "lucide-react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

import { Input } from "@/components/ui/input";
import LogoutModal from "@/components/admin/logout-modal";
import { toast } from "sonner";

export default function AdminNavbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [search, setSearch] = useState("");

  // ================= SOUND =================

  const playSound = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => { });
    }
  };

  const stopSound = () => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  // ================= LOCK BODY SCROLL =================
  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  // ================= CLOSE DROPDOWN =================
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!showModal && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [showModal]);

  // ================= AUDIT =================
  const sendAudit = async (action: string) => {
    try {
      await fetch("/api/admin/audit-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          meta: {
            time: new Date().toISOString(),
            page: "/admin",
          },
        }),
      });
    } catch (err) {
      console.error("Audit failed:", err);
    }
  };

  // ================= LOGOUT =================
  const handleLogout = async () => {
    setLoading(true);

    await sendAudit("ADMIN_LOGOUT_CONFIRMED");

    await signOut({
      callbackUrl: "/",
    });
  };

  // ================= OPEN MODAL =================
  const openModal = () => {
    playSound();
    setShowModal(true);
    setStep(1);
    setPin("");
  void sendAudit("ADMIN_LOGOUT_INITIATED");
  };

  // ================= VERIFY PIN =================
  const verifyPin = async () => {
    if (!pin) return;

    setLoading(true);
    await sendAudit("ADMIN_PIN_ENTERED");

    if (pin === "1234") {
      await handleLogout();
    } else {
      setLoading(false);
  toast.error("Invalid PIN");
    }
  };

  return (
    <>
      {/* AUDIO */}
      <audio ref={audioRef} src="/sounds/logout.mp3" preload="auto" />

      {/* NAVBAR */}
      <div
        className="
    sticky top-0 z-40
    border-b border-zinc-200
    bg-white
    backdrop-blur-2xl
    dark:border-white
    dark:bg-gradient-to-r
    dark:from-black
    dark:via-zinc-900
    dark:to-black
  "
      >
        <div className="flex min-h-20 flex-wrap items-center justify-between gap-3 px-4 py-3 sm:flex-nowrap sm:px-6">
          {/* SEARCH */}
          <div className="order-2 relative w-full sm:order-1 sm:max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users, transactions..."
              className="
    h-11 w-full rounded-2xl
    border border-zinc-300
    bg-white
    pl-10
    text-zinc-900
    placeholder:text-zinc-500
    focus-visible:ring-yellow-500/30
    dark:border-white/10
    dark:bg-white/5
    dark:text-white
  "
            />
          </div>

          {/* RIGHT SIDE */}
          <div className="order-1 flex w-full items-center justify-end gap-3 sm:order-2 sm:w-auto">
            {/* NOTIFICATIONS */}
            <button
              className="
    relative flex h-11 w-11 shrink-0 items-center justify-center
    rounded-2xl
    border border-zinc-300
    bg-white
    transition
    hover:bg-zinc-100
    dark:border-white/10
    dark:bg-white/5
    dark:hover:bg-white/10
  "
            >
              <Bell className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="
    flex h-11 w-11 items-center justify-center rounded-2xl
    border border-zinc-300
    bg-white
    transition
    hover:bg-zinc-100
    dark:border-white/10
    dark:bg-white/5
    dark:hover:bg-white/10
  "
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-zinc-700" />
              )}
            </button>

            {/* PROFILE */}
            <div ref={dropdownRef} className="relative">
              <button
              onClick={() => setDropdownOpen((prev) => !prev)}
                className="
  flex items-center gap-2 rounded-2xl
  border border-zinc-300
  bg-white
  px-2 py-2
  transition
  hover:bg-zinc-100
  sm:gap-3 sm:px-4
  dark:border-white/10
  dark:bg-white/5
  dark:hover:bg-white/10
"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-sm font-bold text-black">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || "A"}
                </div>

                <div className="hidden text-left leading-tight sm:block">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {session?.user?.name || "Admin"}
                  </p>

                  <p className="text-[11px] text-zinc-400">Administrator</p>
                </div>

                <ChevronDown className="hidden h-4 w-4 text-zinc-400 sm:block" />
              </button>

              {dropdownOpen && (
                <div
                  className="
      absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl
      border border-zinc-200
      bg-white shadow-2xl
      dark:border-white/10
      dark:bg-zinc-950
    "
                >
                  <div className="border-b border-zinc-200 px-4 py-3 dark:border-white/10">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                      Admin Panel
                    </p>

                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {session?.user?.email}
                    </p>
                  </div>

                  <Link
                    href="/"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/10"
                  >
                    <Home className="h-4 w-4" />
                    Home
                  </Link>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      openModal();
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-500 transition hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LOGOUT MODAL */}
      <LogoutModal
        open={showModal}
        step={step}
        pin={pin}
        loading={loading}
        showPin={showPin}
        onClose={() => setShowModal(false)}
        onCancel={() => {
          stopSound();
          setShowModal(false);
        }}
        onNext={() => setStep(2)}
        onBack={() => setStep(1)}
        onConfirm={verifyPin}
        onPinChange={setPin}
        onTogglePin={() => setShowPin(!showPin)}
      />
    </>
  );
}
