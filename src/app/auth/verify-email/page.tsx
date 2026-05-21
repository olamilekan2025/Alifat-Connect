"use client";

import { Suspense, useEffect, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { toast } from "sonner";

function VerifyEmailContent() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);

  const [loading, setLoading] = useState(false);

  const [code, setCode] = useState("");

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

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();

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

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Verify Email</h1>

          <p className="mt-2 text-sm text-zinc-400">
            Enter the verification code sent to:
          </p>

          <p className="mt-1 text-sm font-medium text-white break-all">
            {email}
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Verification Code
            </label>

            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
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
