"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    try {
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
          data?.error || "Failed"
        );
        return;
      }

      toast.success(
        "Verification code sent"
      );

      router.push(data.redirectTo);
    } catch {
      toast.error(
        "Forgot password failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <svg
  className="absolute top-0 left-0 h-30 w-full  lg:h-40"
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 1440 320"
  preserveAspectRatio="none"
>
  <defs>
    <linearGradient id="topGlow" x1="0" x2="1">
      <stop
        offset="0%"
        stopColor="#D4AF37"
        stopOpacity="0.95"
      />
      <stop
        offset="35%"
        stopColor="#D4AF37"
        stopOpacity="0.88"
      />
      <stop
        offset="70%"
        stopColor="#D4AF37"
        stopOpacity="0.78"
      />
      <stop
        offset="100%"
        stopColor="#D4AF37"
        stopOpacity="0.60"
      />
    </linearGradient>
  </defs>

  <path
    fill="url(#topGlow)"
    d="
      M0,160
      C240,260 480,40 720,160
      C960,260 1200,60 1440,160
      L1440,0
      L0,0
      Z
    "
  />
</svg>

{/* BOTTOM SVG */}
<svg
  className="absolute bottom-0 left-0 h-30 w-full lg:h-40 "
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 1440 320"
  preserveAspectRatio="none"
>
  <defs>
    <linearGradient id="bottomGlow" x1="1" x2="0">
      <stop
        offset="0%"
        stopColor="#D4AF37"
        stopOpacity="0.92"
      />
      <stop
        offset="35%"
        stopColor="#D4AF37"
        stopOpacity="0.84"
      />
      <stop
        offset="70%"
        stopColor="#D4AF37"
        stopOpacity="0.72"
      />
      <stop
        offset="100%"
        stopColor="#D4AF37"
        stopOpacity="0.50"
      />
    </linearGradient>
  </defs>

  <path
    fill="url(#bottomGlow)"
    d="
      M0,160
      C240,60 480,280 720,160
      C960,40 1200,240 1440,160
      L1440,320
      L0,320
      Z
    "
  />
</svg>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">
            Forgot Password
          </CardTitle>

          <CardDescription>
            Enter your email address to
            receive a password reset code
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={onSubmit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-2xl bg-yellow-500 text-white hover:bg-yellow-600 disabled:bg-yellow-300"
              disabled={loading}
            >
              {loading
                ? "Sending..."
                : "Send Reset Code"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}