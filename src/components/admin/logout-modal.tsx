"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  LogOut,
  Eye,
  EyeOff,
  Loader2,
  ShieldAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type LogoutModalProps = {
  open: boolean;
  step: 1 | 2;
  pin: string;
  loading: boolean;
  showPin: boolean;

onCancel: () => void;
  onClose: () => void;
  onNext: () => void;
  onBack: () => void;
  onConfirm: () => void;
  onPinChange: (value: string) => void;
  onTogglePin: () => void;
};

export default function LogoutModal({
  open,
  step,
  pin,
  loading,
  showPin,
  onClose,
  onCancel,
  onNext,
  onBack,
  onConfirm,
  onPinChange,
  onTogglePin,
}: LogoutModalProps) {
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow =
        "";
    };
  }, [open]);

  if (!open || typeof window === "undefined")
    return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-2xl">

      {/* background overlay */}
      <div
        className="absolute inset-0"
        onClick={() => {}}
      />

      {/* modal */}
      <div className="relative w-[92%] max-w-md overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/95 shadow-[0_0_80px_rgba(0,0,0,0.6)]">

        {/* glow */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-red-500/10 to-transparent pointer-events-none" />

        {/* content */}
        <div className="relative p-6">

          {/* step indicator */}
          <div className="mb-6 flex items-center justify-center gap-2 text-xs font-medium text-zinc-500">
            <span
              className={
                step === 1
                  ? "text-white"
                  : ""
              }
            >
              Confirm
            </span>

            <div className="h-px w-8 bg-zinc-700" />

            <span
              className={
                step === 2
                  ? "text-white"
                  : ""
              }
            >
              Security
            </span>
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="text-center">

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
                <LogOut className="h-7 w-7 text-red-400" />
              </div>

              <h2 className="text-2xl font-bold text-white">
                Confirm Logout
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                You are about to sign out of the
                admin dashboard. Unsaved actions
                may be lost.
              </p>

              <div className="mt-8 flex gap-3">
               <Button
  variant="outline"
  className="flex-1 border-white/10 bg-white/5 text-white hover:bg-white/10"
  onClick={onCancel}
>
  Cancel
</Button>

                <Button
                  className="flex-1 bg-red-500 text-white hover:bg-red-600"
                  onClick={onNext}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="text-center">

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-yellow-500/20 bg-yellow-500/10">
                <ShieldAlert className="h-7 w-7 text-yellow-400" />
              </div>

              <h2 className="text-2xl font-bold text-white">
                Security Verification
              </h2>

              <p className="mt-3 text-sm text-zinc-400">
                Enter your Admin PIN to continue.
              </p>

              <div className="relative mt-6">

                <input
                  type={
                    showPin
                      ? "text"
                      : "password"
                  }
                  value={pin}
                  maxLength={6}
                  onChange={(e) =>
                    onPinChange(
                      e.target.value
                    )
                  }
                  placeholder="••••"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 pr-12 text-center text-lg tracking-[0.4em] text-white outline-none transition focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20"
                />

                <button
                  type="button"
                  onClick={onTogglePin}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showPin ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>

              </div>

              <div className="mt-8 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-white/10 bg-white/5 text-white hover:bg-white/10"
                  onClick={onBack}
                >
                  Back
                </Button>

                <Button
                  className="flex-1 bg-red-500 text-white hover:bg-red-600"
                  disabled={
                    loading ||
                    pin.length < 4
                  }
                  onClick={onConfirm}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Confirm Logout"
                  )}
                </Button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
}