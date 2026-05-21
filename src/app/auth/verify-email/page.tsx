"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { toast } from "sonner";

function VerifyEmailContent() {
  const router = useRouter();

  const searchParams =
    useSearchParams();

  const email =
    searchParams.get("email") ||
    "";

  const token =
    searchParams.get("token") ||
    "";

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    if (!email) {
      toast.error(
        "Invalid verification link"
      );

      router.replace(
        "/auth/register"
      );
    }
  }, [email, router]);

  async function handleVerify() {
    try {
      setLoading(true);

      const res = await fetch(
        "/api/auth/verify-email",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email,
            token,
          }),
        }
      );

      const data = await res
        .json()
        .catch(() => ({}));

      if (!res.ok) {
        toast.error(
          data?.error ||
            "Verification failed"
        );

        return;
      }

      toast.success(
        "Email verified successfully"
      );

      router.push(
        "/auth/login"
      );
    } catch {
      toast.error(
        "Verification failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* YOUR EXISTING JSX/UI HERE */}

      <button
        onClick={handleVerify}
      >
        {loading
          ? "Verifying..."
          : "Verify Email"}
      </button>
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