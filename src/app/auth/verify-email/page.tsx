
"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    setMounted(true);
  }, []);

  const email = mounted ? searchParams.get("email") || "" : "";

  useEffect(() => {
    if (mounted && !email) {
      toast.error("Invalid verification link");
      router.replace("/auth/register");
    }
  }, [mounted, email, router]);

  useEffect(() => {
    if (countdown === 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const code = otp.join("");

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    const updated = [...otp];

    pasted.split("").forEach((digit, index) => {
      updated[index] = digit;
    });

    setOtp(updated);

    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();

    if (code.length !== 6) {
      toast.error("Enter the complete verification code.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data?.error || "Verification failed");
        return;
      }

      toast.success("Email verified successfully");
      router.push("/auth/login");
    } catch (error) {
      console.error(error);
      toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      setResending(true);

      const res = await fetch("/api/auth/resend-verification-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data?.error || "Failed to resend code");
        return;
      }

      toast.success("Verification code sent.");

      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } catch (error) {
      console.error(error);
      toast.error("Failed to resend code");
    } finally {
      setResending(false);
    }
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black px-4">
      {/* TOP SVG */}
      <svg
        className="absolute top-0 left-0 h-32 w-full lg:h-25"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="topGlow" x1="0" x2="1">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#D4AF37" stopOpacity="0.82" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.45" />
          </linearGradient>
        </defs>

        <path
          fill="url(#topGlow)"
          d="M0,160 C240,260 480,40 720,160 C960,260 1200,60 1440,160 L1440,0 L0,0 Z"
        />
      </svg>

      {/* Bottom SVG */}
      <svg
        className="absolute bottom-0 left-0 h-32 w-full lg:h-25"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="bottomGlow" x1="1" x2="0">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.92" />
            <stop offset="35%" stopColor="#D4AF37" stopOpacity="0.78" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.40" />
          </linearGradient>
        </defs>

        <path
          fill="url(#bottomGlow)"
          d="M0,160 C240,60 480,280 720,160 C960,40 1200,240 1440,160 L1440,320 L0,320 Z"
        />
      </svg>

      <div className="w-full max-w-md rounded-2xl border border-black dark:border-white bg-white dark:bg-black p-6 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Verify Email
          </h1>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Enter the 6-digit verification code sent to
          </p>

          <p className="mt-2 break-all font-semibold text-black dark:text-white">
            {email}
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  className="h-14 w-12 rounded-xl border border-zinc-700 dark:border-white bg-white  text-center text-xl font-bold text-black dark:text-white outline-none transition focus:border-[#D4AF37]"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full rounded-xl bg-[#D4AF37] py-3 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>

          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-sm text-zinc-500">
                Resend code in{" "}
                <span className="font-semibold">{countdown}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-sm font-semibold text-[#D4AF37] hover:underline disabled:opacity-50"
              >
                {resending ? "Sending..." : "Resend Code"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}