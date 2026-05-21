"use client";

import {
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { toast } from "sonner";

import {
  Eye,
  EyeOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function ResetPasswordContent() {
  const router = useRouter();

  const searchParams =
    useSearchParams();

  const email =
    searchParams.get("email") ||
    "";

  const [codes, setCodes] =
    useState([
      "",
      "",
      "",
      "",
      "",
      "",
    ]);

  const [newPassword, setNewPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [resending, setResending] =
    useState(false);

  const [countdown, setCountdown] =
    useState(0);

  const [showPassword, setShowPassword] =
    useState(false);

  const inputsRef = useRef<
    Array<HTMLInputElement | null>
  >([]);

  useEffect(() => {
    if (!email) {
      toast.error(
        "Invalid reset link"
      );

      router.replace(
        "/auth/forgot-password"
      );
    }
  }, [email, router]);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () =>
      clearInterval(timer);
  }, [countdown]);

  const code = codes.join("");

  function handleChange(
    value: string,
    index: number
  ) {
    if (!/^\d*$/.test(value))
      return;

    const newCodes = [...codes];

    newCodes[index] =
      value.slice(-1);

    setCodes(newCodes);

    if (value && index < 5) {
      inputsRef.current[
        index + 1
      ]?.focus();
    }
  }

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) {
    if (e.key === "Backspace") {
      if (codes[index]) {
        const newCodes = [
          ...codes,
        ];

        newCodes[index] = "";

        setCodes(newCodes);

        return;
      }

      if (index > 0) {
        inputsRef.current[
          index - 1
        ]?.focus();
      }
    }

    if (e.key === "ArrowLeft") {
      if (index > 0) {
        inputsRef.current[
          index - 1
        ]?.focus();
      }
    }

    if (e.key === "ArrowRight") {
      if (index < 5) {
        inputsRef.current[
          index + 1
        ]?.focus();
      }
    }
  }

  function handlePaste(
    e: React.ClipboardEvent<HTMLInputElement>
  ) {
    e.preventDefault();

    const pastedData =
      e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 6);

    if (!pastedData) return;

    const newCodes = [...codes];

    pastedData
      .split("")
      .forEach(
        (char, index) => {
          if (index < 6) {
            newCodes[index] =
              char;
          }
        }
      );

    setCodes(newCodes);

    const focusIndex =
      Math.min(
        pastedData.length,
        5
      );

    inputsRef.current[
      focusIndex
    ]?.focus();
  }

  async function handleResendCode() {
    if (!email) return;

    try {
      setResending(true);

      const res = await fetch(
        "/api/auth/forgot-password",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await res
        .json()
        .catch(() => ({}));

      if (!res.ok) {
        toast.error(
          data?.error ||
            "Failed to resend code"
        );

        return;
      }

      toast.success(
        "Verification code resent"
      );

      setCountdown(60);
    } catch {
      toast.error(
        "Failed to resend code"
      );
    } finally {
      setResending(false);
    }
  }

  async function onSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (code.length !== 6) {
      toast.error(
        "Enter the 6-digit verification code"
      );

      return;
    }

    const passwordChecks = {
      length:
        newPassword.length >= 6,

      uppercase:
        /[A-Z]/.test(
          newPassword
        ),

      number:
        /\d/.test(newPassword),

      symbol:
        /[\W_]/.test(
          newPassword
        ),
    };

    if (
      !passwordChecks.length ||
      !passwordChecks.uppercase ||
      !passwordChecks.number ||
      !passwordChecks.symbol
    ) {
      toast.error(
        "Password does not meet requirements"
      );

      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "/api/auth/reset-password",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email,
            code,
            password:
              newPassword,
          }),
        }
      );

      const data = await res
        .json()
        .catch(() => ({}));

      if (!res.ok) {
        toast.error(
          data?.error ||
            "Reset failed"
        );

        return;
      }

      toast.success(
        "Password reset successful"
      );

      router.push(
        "/auth/login"
      );
    } catch {
      toast.error(
        "Reset failed"
      );
    } finally {
      setLoading(false);
    }
  }

  const passwordChecks = {
    length:
      newPassword.length >= 6,

    uppercase:
      /[A-Z]/.test(
        newPassword
      ),

    number:
      /\d/.test(newPassword),

    symbol:
      /[\W_]/.test(
        newPassword
      ),
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">
            Reset Password
          </CardTitle>

          <CardDescription>
            Enter the verification
            code and your new
            password
          </CardDescription>

          <p className="break-all text-sm font-medium text-primary">
            {email}
          </p>
        </CardHeader>

        <CardContent>
          {/* KEEP YOUR EXISTING FORM JSX HERE */}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}