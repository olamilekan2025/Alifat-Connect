
"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  MailCheck,
  Loader2,
  RefreshCw,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

function VerifyLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = (searchParams.get("email") || "")
    .trim()
    .toLowerCase();

  const [password, setPassword] = useState("");
  const [code, setCode] = useState<string[]>(
    Array(CODE_LENGTH).fill("")
  );
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!email) {
      toast.error("Missing email address. Please sign in again.");
      router.replace("/auth/login");
    }
  }, [email, router]);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = window.setTimeout(() => {
      setCountdown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown]);

  const focusCodeInput = useCallback((index: number) => {
    const input = document.getElementById(
      `code-${index}`
    ) as HTMLInputElement | null;

    input?.focus();
    input?.select();
  }, []);

  function handleCodeChange(index: number, value: string) {
    // Support a single digit in each box.
    const digit = value.replace(/\D/g, "").slice(-1);

    setCode((previous) => {
      const next = [...previous];
      next[index] = digit;
      return next;
    });

    if (digit && index < CODE_LENGTH - 1) {
      focusCodeInput(index + 1);
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);

    if (!pasted) return;

    const next = Array(CODE_LENGTH).fill("");

    pasted.split("").forEach((digit, index) => {
      next[index] = digit;
    });

    setCode(next);

    focusCodeInput(Math.min(pasted.length, CODE_LENGTH - 1));
  }

  function handleKeyDown(
    index: number,
    event: KeyboardEvent<HTMLInputElement>
  ) {
    if (
      event.key === "Backspace" &&
      !code[index] &&
      index > 0
    ) {
      focusCodeInput(index - 1);
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusCodeInput(index - 1);
    }

    if (
      event.key === "ArrowRight" &&
      index < CODE_LENGTH - 1
    ) {
      event.preventDefault();
      focusCodeInput(index + 1);
    }
  }

  async function handleResendCode() {
    if (!email || countdown > 0 || resending || loading) {
      return;
    }

    setResending(true);

    try {
      const response = await fetch(
        "/api/auth/resend-login-code",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success !== true) {
        toast.error(
          data.error || "Unable to resend the verification code."
        );
        return;
      }

      setCode(Array(CODE_LENGTH).fill(""));
      setCountdown(RESEND_COOLDOWN_SECONDS);
      toast.success(
        data.message || "A new verification code has been sent."
      );

      focusCodeInput(0);
    } catch {
      toast.error(
        "Network error. Please check your connection and try again."
      );
    } finally {
      setResending(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email) {
      toast.error("Missing email address. Please sign in again.");
      return;
    }

    if (!password) {
      toast.error("Please enter your password.");
      return;
    }

    const verificationCode = code.join("");

    if (!/^\d{6}$/.test(verificationCode)) {
      toast.error("Please enter all six digits of the verification code.");
      focusCodeInput(code.findIndex((digit) => !digit) >= 0
        ? code.findIndex((digit) => !digit)
        : 0);
      return;
    }

    setLoading(true);

    try {
      // Step 1: Verify the password and OTP on the server.
      const response = await fetch("/api/auth/verify-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: verificationCode,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success !== true || !data.grantToken) {
        toast.error(
          data.error || "Verification failed. Please try again."
        );
        return;
      }

      // Step 2: Complete NextAuth sign-in with the one-time server grant.
      // Do not use adminVerified: true; the server no longer trusts that flag.
      const loginResult = await signIn("credentials", {
        email,
        password,
        adminLoginGrant: data.grantToken,
        redirect: false,
      });

      if (!loginResult || loginResult.error) {
        toast.error(
          "Verification succeeded, but sign-in could not be completed. Please sign in again."
        );
        return;
      }

      toast.success("Admin login successful.");

      router.replace("/admin-dashboard");
      router.refresh();
    } catch {
      toast.error(
        "A network error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-10 dark:bg-black">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-white dark:bg-black/70" />

      {/* Top decorative wave */}
      <svg
        className="pointer-events-none absolute left-0 top-0 h-32 w-full lg:h-40"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="topGlow"
            x1="0"
            y1="0"
            x2="1"
            y2="0"
          >
            <stop
              offset="0%"
              stopColor="#D4AF37"
              stopOpacity="0.95"
            />
            <stop
              offset="35%"
              stopColor="#D4AF37"
              stopOpacity="0.82"
            />
            <stop
              offset="100%"
              stopColor="#D4AF37"
              stopOpacity="0.45"
            />
          </linearGradient>
        </defs>

        <path
          fill="url(#topGlow)"
          d="M0,160 C240,260 480,40 720,160 C960,260 1200,60 1440,160 L1440,0 L0,0 Z"
        />
      </svg>

      {/* Bottom decorative wave */}
      <svg
        className="pointer-events-none absolute bottom-0 left-0 h-32 w-full lg:h-40"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="bottomGlow"
            x1="1"
            y1="0"
            x2="0"
            y2="0"
          >
            <stop
              offset="0%"
              stopColor="#D4AF37"
              stopOpacity="0.92"
            />
            <stop
              offset="35%"
              stopColor="#D4AF37"
              stopOpacity="0.78"
            />
            <stop
              offset="100%"
              stopColor="#D4AF37"
              stopOpacity="0.4"
            />
          </linearGradient>
        </defs>

        <path
          fill="url(#bottomGlow)"
          d="M0,160 C240,60 480,280 720,160 C960,40 1200,240 1440,160 L1440,320 L0,320 Z"
        />
      </svg>

      {/* Verification card */}
      <Card className="relative z-10 w-full max-w-md overflow-hidden rounded-[34px] border border-zinc-200 bg-white/90 shadow-2xl shadow-yellow-500/5 backdrop-blur-3xl dark:border-white/10 dark:bg-zinc-950/90">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-yellow-500/10">
            <MailCheck
              className="h-8 w-8 text-yellow-500"
              aria-hidden="true"
            />
          </div>

          <div className="space-y-2">
            <CardTitle className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
              Verify Login
            </CardTitle>

            <CardDescription className="text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
              Enter the six-digit verification code sent to
              <span className="ml-1 break-all font-semibold text-yellow-600 dark:text-yellow-400">
                {email || "your email address"}
              </span>
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-6 pb-8 sm:px-8">
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="admin-password"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Password
              </label>

              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  autoComplete="current-password"
                  className="h-14 rounded-2xl border border-zinc-200 bg-white px-4 pr-12 text-zinc-900 placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-yellow-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-yellow-500 dark:text-zinc-400"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Six-digit verification code */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Verification Code
                </label>

                <button
                  type="button"
                  disabled={
                    resending || loading || countdown > 0 || !email
                  }
                  onClick={handleResendCode}
                  className="flex items-center gap-1 text-xs font-semibold text-yellow-600 hover:underline disabled:cursor-not-allowed disabled:text-zinc-400 disabled:no-underline dark:text-yellow-400"
                >
                  {resending && (
                    <RefreshCw
                      className="h-3 w-3 animate-spin"
                      aria-hidden="true"
                    />
                  )}

                  {countdown > 0
                    ? `Resend in ${countdown}s`
                    : "Resend code"}
                </button>
              </div>

              <div className="flex justify-center gap-2">
                {code.map((digit, index) => (
                  <Input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete={
                      index === 0 ? "one-time-code" : "off"
                    }
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(event) =>
                      handleCodeChange(index, event.target.value)
                    }
                    onKeyDown={(event) =>
                      handleKeyDown(index, event)
                    }
                    onPaste={handlePaste}
                    aria-label={`Verification code digit ${index + 1}`}
                    className="h-12 w-10 rounded-xl border border-zinc-200 bg-white p-0 text-center text-xl font-bold text-zinc-900 focus-visible:ring-2 focus-visible:ring-yellow-500 dark:border-white/10 dark:bg-white/5 dark:text-white sm:h-14 sm:w-12"
                    required
                  />
                ))}
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading || resending || !email}
              className="h-14 w-full rounded-2xl bg-yellow-500 text-base font-bold text-black transition-all hover:bg-yellow-400 hover:shadow-lg hover:shadow-yellow-500/20 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Login"
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            Wrong email?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-yellow-600 hover:underline dark:text-yellow-400"
            >
              Go back
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
        </div>
      }
    >
      <VerifyLoginContent />
    </Suspense>
  );
}
